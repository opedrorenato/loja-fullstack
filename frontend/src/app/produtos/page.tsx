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
    const [sucesso, setSucesso] = useState("");

    // Modal Novo Produto
    const [modalNovoAberto, setModalNovoAberto] = useState(false);
    const [nome, setNome] = useState("");
    const [preco, setPreco] = useState("");
    const [estoque, setEstoque] = useState("");
    const [criando, setCriando] = useState(false);

    // Modal Editar Produto
    const [modalEditarAberto, setModalEditarAberto] = useState(false);
    const [produtoSelecionado, setProdutoSelecionado] = useState<ProdutoResponse | null>(null);
    const [atualizando, setAtualizando] = useState(false);

    // Modal Excluir Produto
    const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
    const [excluindo, setExcluindo] = useState(false);

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
            const precoNumerico = Number(preco.replace(/\D/g, "")) / 100;
            await produtoService.create({
                nome,
                preco: precoNumerico,
                estoque: Number(estoque)
            });
            setModalNovoAberto(false);
            setNome("");
            setPreco("");
            setEstoque("");
            carregarProdutos();
        } catch (error: any) {
            setErro(error.message || "Erro ao criar produto.");
        } finally {
            setCriando(false);
        }
    }

    function handleAbrirEdicao(produto: ProdutoResponse) {
        setProdutoSelecionado(produto);
        setNome(produto.nome);
        setPreco((produto.preco * 100).toFixed(0));
        setEstoque(produto.estoque.toString());
        setModalEditarAberto(true);
    }

    async function handleEditarProduto() {
        if (!produtoSelecionado || !nome || !preco || !estoque) return;

        setAtualizando(true);
        setErro("");
        try {
            const precoNumerico = Number(preco.replace(/\D/g, "")) / 100;
            await produtoService.update(produtoSelecionado.codProduto, {
                nome,
                preco: precoNumerico,
                estoque: Number(estoque)
            });
            setModalEditarAberto(false);
            setSucesso("Produto atualizado com sucesso!");
            setTimeout(() => setSucesso(""), 3000);
            carregarProdutos();
        } catch (error: any) {
            setErro(error.message || "Erro ao atualizar produto.");
            setModalEditarAberto(false);
        } finally {
            setAtualizando(false);
        }
    }

    async function handleDeletarProduto() {
        if (!produtoSelecionado) return;

        setExcluindo(true);
        setErro("");
        try {
            await produtoService.delete(produtoSelecionado.codProduto);
            setModalExcluirAberto(false);
            setSucesso("Produto removido com sucesso!");
            setTimeout(() => setSucesso(""), 3000);
            carregarProdutos();
        } catch (error: any) {
            setErro(error.message || "Erro ao excluir produto.");
            setModalExcluirAberto(false);
        } finally {
            setExcluindo(false);
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

                {sucesso && (
                    <div className="bg-emerald-900/40 border border-emerald-700 text-emerald-400 rounded-lg px-4 py-3 text-sm">
                        ✅ {sucesso}
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
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleAbrirEdicao(p)}
                                            title="Editar Produto"
                                        >
                                            ✏️
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="hover:bg-red-900/20 text-red-400"
                                            onClick={() => {
                                                setProdutoSelecionado(p);
                                                setModalExcluirAberto(true);
                                            }}
                                            title="Excluir Produto"
                                        >
                                            🗑️
                                        </Button>
                                    </div>
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
                            label="Preço"
                            placeholder="R$ 0,00"
                            mask="currency"
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

            {/* Modal Editar Produto */}
            <Modal
                open={modalEditarAberto}
                title="Editar Produto"
                onClose={() => setModalEditarAberto(false)}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setModalEditarAberto(false)}>Cancelar</Button>
                        <Button loading={atualizando} onClick={handleEditarProduto}>Salvar Alterações</Button>
                    </>
                }
            >
                <div className="flex flex-col gap-4">
                    <Input
                        label="Nome do Produto"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Preço"
                            mask="currency"
                            value={preco}
                            onChange={(e) => setPreco(e.target.value)}
                        />
                        <Input
                            label="Quantidade em Estoque"
                            type="number"
                            value={estoque}
                            onChange={(e) => setEstoque(e.target.value)}
                        />
                    </div>
                </div>
            </Modal>

            {/* Modal Excluir Produto */}
            <Modal
                open={modalExcluirAberto}
                title="Excluir Produto"
                onClose={() => setModalExcluirAberto(false)}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setModalExcluirAberto(false)}>Cancelar</Button>
                        <Button
                            variant="danger"
                            loading={excluindo}
                            onClick={handleDeletarProduto}
                        >
                            Excluir Produto
                        </Button>
                    </>
                }
            >
                {produtoSelecionado && (
                    <div className="flex flex-col gap-3">
                        <p className="text-white">
                            Tem certeza que deseja excluir o produto <span className="font-bold text-blue-400">{produtoSelecionado.nome}</span>?
                        </p>
                        <div className="bg-amber-900/20 border border-amber-900/50 p-4 rounded-lg">
                            <p className="text-xs text-amber-400 leading-relaxed">
                                ⚠️ <strong>Atenção:</strong> Por questões de integridade, o sistema não permite a exclusão de produtos que possuam pedidos vinculados.
                            </p>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
}
