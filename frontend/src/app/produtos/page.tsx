"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Table } from "@/components/ui/Table";
import { produtoService } from "@/services/produto-service";
import { ProdutoResponse } from "@/types";
import { formatarMoeda } from "@/utils/format";

export default function ProdutosPage() {
    const [produtos, setProdutos] = useState<ProdutoResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState("");

    // Modal Novo Produto
    const [modalNovoAberto, setModalNovoAberto] = useState(false);
    const [nome, setNome] = useState("");
    const [preco, setPreco] = useState("");
    const [estoque, setEstoque] = useState("");
    const [criando, setCriando] = useState(false);

    // Modal Editar Estoque
    const [modalEditarAberto, setModalEditarAberto] = useState(false);
    const [produtoSelecionado, setProdutoSelecionado] = useState<ProdutoResponse | null>(null);
    const [novoEstoque, setNovoEstoque] = useState("");
    const [atualizando, setAtualizando] = useState(false);

    const carregarProdutos = useCallback(async () => {
        setLoading(true);
        setErro("");
        try {
            const data = await produtoService.getAll();
            setProdutos(data);
        } catch {
            setErro("Erro ao carregar produtos.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        carregarProdutos();
    }, [carregarProdutos]);

    async function handleCriarProduto() {
        if (!nome || !preco || !estoque) return;

        setCriando(true);
        try {
            await produtoService.create({
                nome,
                preco: Number(preco),
                estoque: Number(estoque)
            });
            setModalNovoAberto(false);
            setNome("");
            setPreco("");
            setEstoque("");
            carregarProdutos();
        } catch {
            setErro("Erro ao criar produto.");
        } finally {
            setCriando(false);
        }
    }

    async function handleAtualizarEstoque() {
        if (!produtoSelecionado || !novoEstoque) return;

        setAtualizando(true);
        try {
            await produtoService.updateEstoque(produtoSelecionado.codProduto, Number(novoEstoque));
            setModalEditarAberto(false);
            setProdutoSelecionado(null);
            setNovoEstoque("");
            carregarProdutos();
        } catch {
            setErro("Erro ao atualizar estoque.");
        } finally {
            setAtualizando(false);
        }
    }

    return (
        <>
            <Header
                title="Produtos"
                subtitle="Gerencie o estoque e preços dos produtos"
                actions={
                    <Button onClick={() => setModalNovoAberto(true)}>+ Novo Produto</Button>
                }
            />

            <div className="p-8 flex flex-col gap-6">
                {erro && (
                    <div className="bg-red-900/40 border border-red-700 text-red-400 rounded-lg px-4 py-3 text-sm">
                        {erro}
                    </div>
                )}

                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-700">
                        <p className="text-sm font-semibold text-slate-300">
                            {loading ? "Carregando..." : `${produtos.length} produto(s) encontrado(s)`}
                        </p>
                    </div>

                    <Table
                        loading={loading}
                        data={produtos}
                        keyExtractor={(p) => p.codProduto}
                        emptyMessage="Nenhum produto encontrado."
                        columns={[
                            {
                                header: "#",
                                accessor: (p) => (
                                    <span className="font-mono text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                                        #{p.codProduto}
                                    </span>
                                ),
                                className: "w-16",
                            },
                            {
                                header: "Nome",
                                accessor: (p) => (
                                    <span className="font-medium text-slate-200">{p.nome}</span>
                                ),
                            },
                            {
                                header: "Preço",
                                accessor: (p) => (
                                    <span className="text-slate-300">{formatarMoeda(p.preco)}</span>
                                ),
                            },
                            {
                                header: "Estoque",
                                accessor: (p) => (
                                    <div className="flex items-center gap-2">
                                        <span className={`font-semibold ${p.estoque <= 5 ? "text-red-400" : "text-blue-400"}`}>
                                            {p.estoque} un.
                                        </span>
                                    </div>
                                ),
                            },
                            {
                                header: "Ações",
                                accessor: (p) => (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            setProdutoSelecionado(p);
                                            setNovoEstoque(p.estoque.toString());
                                            setModalEditarAberto(true);
                                        }}
                                    >
                                        ✏️ Editar Estoque
                                    </Button>
                                ),
                                className: "text-right",
                            },
                        ]}
                    />
                </div>
            </div>

            {/* Modal Novo Produto */}
            <Modal
                open={modalNovoAberto}
                title="Novo Produto"
                onClose={() => setModalNovoAberto(false)}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setModalNovoAberto(false)}>Cancelar</Button>
                        <Button loading={criando} onClick={handleCriarProduto}>Salvar Produto</Button>
                    </>
                }
            >
                <div className="flex flex-col gap-4">
                    <Input
                        label="Nome do Produto"
                        placeholder="Ex: Teclado Mecânico"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Preço (R$)"
                            type="number"
                            placeholder="0.00"
                            value={preco}
                            onChange={(e) => setPreco(e.target.value)}
                        />
                        <Input
                            label="Estoque Inicial"
                            type="number"
                            placeholder="0"
                            value={estoque}
                            onChange={(e) => setEstoque(e.target.value)}
                        />
                    </div>
                </div>
            </Modal>

            {/* Modal Editar Estoque */}
            <Modal
                open={modalEditarAberto}
                title="Editar Estoque"
                onClose={() => setModalEditarAberto(false)}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setModalEditarAberto(false)}>Cancelar</Button>
                        <Button loading={atualizando} onClick={handleAtualizarEstoque}>Atualizar Estoque</Button>
                    </>
                }
            >
                {produtoSelecionado && (
                    <div className="flex flex-col gap-4">
                        <p className="text-sm text-slate-400">
                            Atualizando o estoque do produto: <span className="text-white font-medium">{produtoSelecionado.nome}</span>
                        </p>
                        <Input
                            label="Nova Quantidade em Estoque"
                            type="number"
                            value={novoEstoque}
                            onChange={(e) => setNovoEstoque(e.target.value)}
                            autoFocus
                        />
                    </div>
                )}
            </Modal>
        </>
    );
}
