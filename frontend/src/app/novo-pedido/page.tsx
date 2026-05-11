"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Table } from "@/components/ui/Table";
import { produtoService } from "@/services/produto-service";
import { pedidoService } from "@/services/pedido-service";
import { ProdutoResponse } from "@/types";

interface ItemCarrinho {
    codProduto: number;
    nomeProduto: string;
    preco: number;
    quantidade: number;
}

function NovoPedidoContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const cnpj = searchParams.get("cnpj") ?? "";

    const [produtos, setProdutos] = useState<ProdutoResponse[]>([]);
    const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
    const [loading, setLoading] = useState(true);
    const [finalizando, setFinalizando] = useState(false);
    const [erro, setErro] = useState("");

    const carregarProdutos = useCallback(async () => {
        if (!cnpj) { router.push("/"); return; }
        setLoading(true);
        try {
            const data = await produtoService.getAll();
            setProdutos(data);
        } catch {
            setErro("Erro ao carregar produtos.");
        } finally {
            setLoading(false);
        }
    }, [cnpj, router]);

    useEffect(() => { carregarProdutos(); }, [carregarProdutos]);

    function qtdNoCarrinho(codProduto: number) {
        return carrinho.find((i) => i.codProduto === codProduto)?.quantidade ?? 0;
    }

    function estoqueDisponivel(produto: ProdutoResponse) {
        return produto.estoque - qtdNoCarrinho(produto.codProduto);
    }

    function handleAumentar(produto: ProdutoResponse) {
        if (estoqueDisponivel(produto) <= 0) {
            setErro(`Estoque insuficiente para "${produto.nome}".`);
            return;
        }
        setErro("");
        setCarrinho((prev) => {
            const existente = prev.find((i) => i.codProduto === produto.codProduto);
            if (existente) {
                return prev.map((i) =>
                    i.codProduto === produto.codProduto
                        ? { ...i, quantidade: i.quantidade + 1 }
                        : i
                );
            }
            return [...prev, {
                codProduto: produto.codProduto,
                nomeProduto: produto.nome,
                preco: produto.preco,
                quantidade: 1,
            }];
        });
    }

    function handleDiminuir(codProduto: number) {
        setCarrinho((prev) => {
            const existente = prev.find((i) => i.codProduto === codProduto);
            if (!existente) return prev;
            if (existente.quantidade === 1) return prev.filter((i) => i.codProduto !== codProduto);
            return prev.map((i) =>
                i.codProduto === codProduto ? { ...i, quantidade: i.quantidade - 1 } : i
            );
        });
    }

    function handleRemoverItem(codProduto: number) {
        setCarrinho((prev) => prev.filter((i) => i.codProduto !== codProduto));
    }

    async function handleFinalizar() {
        if (carrinho.length === 0) {
            setErro("Adicione pelo menos um item ao pedido.");
            return;
        }
        setFinalizando(true);
        setErro("");
        try {
            const pedido = await pedidoService.create({
                cnpj,
                itens: carrinho.map((i) => ({
                    codProduto: i.codProduto,
                    quantidade: i.quantidade,
                })),
            });
            router.push(`/pedidos/${pedido.codPedido}`);
        } catch (e: unknown) {
            if (e instanceof Error) setErro(e.message);
        } finally {
            setFinalizando(false);
        }
    }

    function formatarValor(valor: number) {
        return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }

    const valorTotal = carrinho.reduce((acc, i) => acc + i.preco * i.quantidade, 0);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-slate-400 text-sm">Carregando...</div>
            </div>
        );
    }

    return (
        <>
            <Header
                title="Novo Pedido"
                subtitle={`CNPJ: ${cnpj}`}
                actions={
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-xs text-slate-400">Total do carrinho</p>
                            <p className="text-xl font-bold text-blue-400">{formatarValor(valorTotal)}</p>
                        </div>
                        <Button
                            loading={finalizando}
                            disabled={carrinho.length === 0}
                            onClick={handleFinalizar}
                        >
                            Finalizar Pedido →
                        </Button>
                    </div>
                }
            />

            <div className="p-8 flex flex-col gap-6">
                {erro && (
                    <div className="bg-red-900/40 border border-red-700 text-red-400 rounded-lg px-4 py-3 text-sm">
                        {erro}
                    </div>
                )}

                <div className="grid grid-cols-3 gap-6">
                    {/* Produtos */}
                    <div className="col-span-2 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-700">
                            <p className="text-sm font-semibold text-slate-300">📦 Produtos disponíveis</p>
                        </div>
                        <Table
                            data={produtos}
                            keyExtractor={(p) => p.codProduto}
                            emptyMessage="Nenhum produto cadastrado."
                            columns={[
                                {
                                    header: "Produto",
                                    accessor: (p) => (
                                        <span className="font-medium text-slate-200">{p.nome}</span>
                                    ),
                                },
                                {
                                    header: "Preço",
                                    accessor: (p) => (
                                        <span className="text-blue-400 font-semibold">{formatarValor(p.preco)}</span>
                                    ),
                                },
                                {
                                    header: "Estoque",
                                    accessor: (p) => {
                                        const disp = estoqueDisponivel(p);
                                        return (
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                        ${disp === 0
                                                    ? "bg-red-900/50 text-red-400"
                                                    : disp <= 3
                                                        ? "bg-yellow-900/50 text-yellow-400"
                                                        : "bg-green-900/50 text-green-400"
                                                }`}>
                                                {disp === 0 ? "Sem estoque" : `${disp} un.`}
                                            </span>
                                        );
                                    },
                                },
                                {
                                    header: "Quantidade",
                                    accessor: (p) => {
                                        const qtd = qtdNoCarrinho(p.codProduto);
                                        const disp = estoqueDisponivel(p);
                                        return (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleDiminuir(p.codProduto)}
                                                    disabled={qtd === 0}
                                                    className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold
                            disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                                >
                                                    −
                                                </button>
                                                <span className={`w-6 text-center text-sm font-semibold ${qtd > 0 ? "text-white" : "text-slate-500"}`}>
                                                    {qtd}
                                                </span>
                                                <button
                                                    onClick={() => handleAumentar(p)}
                                                    disabled={disp === 0}
                                                    className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold
                            disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        );
                                    },
                                },
                            ]}
                        />
                    </div>

                    {/* Carrinho */}
                    <div className="flex flex-col gap-4">
                        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-700">
                                <p className="text-sm font-semibold text-slate-300">🧾 Carrinho</p>
                            </div>

                            {carrinho.length === 0 ? (
                                <div className="px-5 py-8 text-center text-slate-500 text-sm">
                                    Nenhum item adicionado ainda.
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-700">
                                    {carrinho.map((item) => (
                                        <div key={item.codProduto} className="px-5 py-3 flex items-center justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-slate-200 truncate">{item.nomeProduto}</p>
                                                <p className="text-xs text-slate-500">
                                                    {item.quantidade}x {formatarValor(item.preco)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-sm font-semibold text-blue-400">
                                                    {formatarValor(item.preco * item.quantidade)}
                                                </span>
                                                <button
                                                    onClick={() => handleRemoverItem(item.codProduto)}
                                                    className="text-slate-500 hover:text-red-400 transition-colors text-lg leading-none"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="px-5 py-4 border-t border-slate-700 bg-slate-900/40">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-slate-300">Total</span>
                                    <span className="text-lg font-bold text-blue-400">{formatarValor(valorTotal)}</span>
                                </div>
                            </div>
                        </div>

                        <Button variant="secondary" onClick={() => router.push("/")} className="w-full">
                            ← Voltar para pedidos
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default function NovoPedidoPage() {
    return (
        <Suspense>
            <NovoPedidoContent />
        </Suspense>
    );
}