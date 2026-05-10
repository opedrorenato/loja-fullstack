"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Table } from "@/components/ui/Table";
import { produtoService } from "@/services/produto-service";
import { pedidoService } from "@/services/pedido-service";
import { ProdutoResponse, PedidoResponse } from "@/types";

function NovoPedidoContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pedidoId = Number(searchParams.get("pedidoId"));

    const [produtos, setProdutos] = useState<ProdutoResponse[]>([]);
    const [pedido, setPedido] = useState<PedidoResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingProduto, setLoadingProduto] = useState<number | null>(null);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    const carregarDados = useCallback(async () => {
        if (!pedidoId) { router.push("/"); return; }
        setLoading(true);
        try {
            const [produtosData, pedidoData] = await Promise.all([
                produtoService.getAll(),
                pedidoService.getById(pedidoId),
            ]);
            setProdutos(produtosData);
            setPedido(pedidoData);
        } catch {
            setErro("Erro ao carregar dados.");
        } finally {
            setLoading(false);
        }
    }, [pedidoId, router]);

    useEffect(() => { carregarDados(); }, [carregarDados]);

    function mostrarSucesso(msg: string) {
        setSucesso(msg);
        setTimeout(() => setSucesso(""), 3000);
    }

    function quantidadeNoPedido(codProduto: number) {
        return pedido?.itens.find((i) => i.codProduto === codProduto)?.quantidade ?? 0;
    }

    // Aumenta quantidade — se já está no pedido, remove e re-adiciona com nova qtd
    // Se não está, adiciona com qtd 1
    async function handleAumentar(produto: ProdutoResponse) {
        const qtdAtual = quantidadeNoPedido(produto.codProduto);
        const novaQtd = qtdAtual + 1;

        if (novaQtd > produto.estoque + qtdAtual) {
            setErro(`Estoque insuficiente. Disponível: ${produto.estoque} un.`);
            return;
        }

        setLoadingProduto(produto.codProduto);
        setErro("");
        try {
            // Remove o item atual e readiciona com nova quantidade
            if (qtdAtual > 0) {
                await pedidoService.removeItem(pedidoId, produto.codProduto);
            }
            const pedidoAtualizado = await pedidoService.addItem(pedidoId, {
                codProduto: produto.codProduto,
                quantidade: novaQtd,
            });
            setPedido(pedidoAtualizado);
            setProdutos((prev) =>
                prev.map((p) =>
                    p.codProduto === produto.codProduto
                        ? { ...p, estoque: p.estoque - 1 }
                        : p
                )
            );
            mostrarSucesso(`"${produto.nome}" atualizado para ${novaQtd}x`);
        } catch (e: unknown) {
            if (e instanceof Error) setErro(e.message);
        } finally {
            setLoadingProduto(null);
        }
    }

    async function handleDiminuir(produto: ProdutoResponse) {
        const qtdAtual = quantidadeNoPedido(produto.codProduto);
        if (qtdAtual === 0) return;

        setLoadingProduto(produto.codProduto);
        setErro("");
        try {
            // Remove o item
            await pedidoService.removeItem(pedidoId, produto.codProduto);

            // Se ainda sobra quantidade, readiciona com qtd - 1
            if (qtdAtual - 1 > 0) {
                const pedidoAtualizado = await pedidoService.addItem(pedidoId, {
                    codProduto: produto.codProduto,
                    quantidade: qtdAtual - 1,
                });
                setPedido(pedidoAtualizado);
            } else {
                const pedidoAtualizado = await pedidoService.getById(pedidoId);
                setPedido(pedidoAtualizado);
                mostrarSucesso(`"${produto.nome}" removido do pedido.`);
            }

            setProdutos((prev) =>
                prev.map((p) =>
                    p.codProduto === produto.codProduto
                        ? { ...p, estoque: p.estoque + 1 }
                        : p
                )
            );
        } catch (e: unknown) {
            if (e instanceof Error) setErro(e.message);
        } finally {
            setLoadingProduto(null);
        }
    }

    async function handleRemoverItem(codProduto: number, nomeProduto: string, quantidade: number) {
        setLoadingProduto(codProduto);
        setErro("");
        try {
            await pedidoService.removeItem(pedidoId, codProduto);
            const pedidoAtualizado = await pedidoService.getById(pedidoId);
            setPedido(pedidoAtualizado);
            setProdutos((prev) =>
                prev.map((p) =>
                    p.codProduto === codProduto
                        ? { ...p, estoque: p.estoque + quantidade }
                        : p
                )
            );
            mostrarSucesso(`"${nomeProduto}" removido do pedido.`);
        } catch (e: unknown) {
            if (e instanceof Error) setErro(e.message);
        } finally {
            setLoadingProduto(null);
        }
    }

    function formatarValor(valor: number) {
        return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }

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
                title={`Pedido #${pedidoId}`}
                subtitle={pedido ? `Cliente: ${pedido.nomeCliente}` : ""}
                actions={
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-xs text-slate-400">Valor total</p>
                            <p className="text-xl font-bold text-blue-400">
                                {formatarValor(pedido?.valorTotal ?? 0)}
                            </p>
                        </div>
                        <Button onClick={() => router.push(`/pedidos/${pedidoId}`)}>
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
                {sucesso && (
                    <div className="bg-green-900/40 border border-green-700 text-green-400 rounded-lg px-4 py-3 text-sm">
                        ✓ {sucesso}
                    </div>
                )}

                <div className="grid grid-cols-3 gap-6">
                    {/* Produtos disponíveis */}
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
                                        <span className="text-blue-400 font-semibold">
                                            {formatarValor(p.preco)}
                                        </span>
                                    ),
                                },
                                {
                                    header: "Estoque",
                                    accessor: (p) => (
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                      ${p.estoque === 0
                                                ? "bg-red-900/50 text-red-400"
                                                : p.estoque <= 3
                                                    ? "bg-yellow-900/50 text-yellow-400"
                                                    : "bg-green-900/50 text-green-400"
                                            }`}>
                                            {p.estoque === 0 ? "Sem estoque" : `${p.estoque} un.`}
                                        </span>
                                    ),
                                },
                                {
                                    header: "Quantidade",
                                    accessor: (p) => {
                                        const qtd = quantidadeNoPedido(p.codProduto);
                                        const carregando = loadingProduto === p.codProduto;

                                        return (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleDiminuir(p)}
                                                    disabled={qtd === 0 || carregando}
                                                    className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold
                            disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                                >
                                                    −
                                                </button>

                                                <span className={`w-6 text-center text-sm font-semibold
                          ${qtd > 0 ? "text-white" : "text-slate-500"}`}>
                                                    {carregando ? (
                                                        <span className="inline-block w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin" />
                                                    ) : qtd}
                                                </span>

                                                <button
                                                    onClick={() => handleAumentar(p)}
                                                    disabled={p.estoque === 0 || carregando}
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

                    {/* Resumo do pedido */}
                    <div className="flex flex-col gap-4">
                        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-700">
                                <p className="text-sm font-semibold text-slate-300">🧾 Itens do pedido</p>
                            </div>

                            {!pedido?.itens.length ? (
                                <div className="px-5 py-8 text-center text-slate-500 text-sm">
                                    Nenhum item adicionado ainda.
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-700">
                                    {pedido.itens.map((item) => (
                                        <div key={item.codProduto} className="px-5 py-3 flex items-center justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-slate-200 truncate">{item.nomeProduto}</p>
                                                <p className="text-xs text-slate-500">
                                                    {item.quantidade}x {formatarValor(item.precoUnitario)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-sm font-semibold text-blue-400">
                                                    {formatarValor(item.subtotal)}
                                                </span>
                                                <button
                                                    onClick={() => handleRemoverItem(item.codProduto, item.nomeProduto, item.quantidade)}
                                                    disabled={loadingProduto === item.codProduto}
                                                    className="text-slate-500 hover:text-red-400 transition-colors text-lg leading-none disabled:opacity-30"
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
                                    <span className="text-lg font-bold text-blue-400">
                                        {formatarValor(pedido?.valorTotal ?? 0)}
                                    </span>
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