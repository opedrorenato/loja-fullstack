"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { pedidoService } from "@/services/pedido-service";
import { PedidoResponse } from "@/types";
import { formatarCnpj, formatarData, formatarMoeda } from "@/utils/format";

export default function DetalhePedidoPage() {
    const router = useRouter();
    const { id } = useParams();

    const [pedido, setPedido] = useState<PedidoResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState("");

    const carregarPedido = useCallback(async () => {
        setLoading(true);
        try {
            const data = await pedidoService.getById(Number(id));
            if (!data) { router.push("/"); return; }
            setPedido(data);
        } catch {
            setErro("Erro ao carregar pedido.");
        } finally {
            setLoading(false);
        }
    }, [id, router]);

    useEffect(() => { carregarPedido(); }, [carregarPedido]);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-slate-400 text-sm">Carregando...</div>
            </div>
        );
    }

    if (erro || !pedido) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-red-400 text-sm">{erro || "Pedido não encontrado."}</div>
            </div>
        );
    }

    return (
        <>
            <Header
                title={`Pedido #${pedido.codPedido}`}
                subtitle={`Criado em ${formatarData(pedido.dataPedido)}`}
                actions={
                    <Button variant="secondary" onClick={() => router.push("/")}>
                        ← Voltar para pedidos
                    </Button>
                }
            />

            <div className="p-8 flex flex-col gap-6">
                <div className="grid grid-cols-3 gap-6">

                    {/* Informações do pedido */}
                    <div className="col-span-2 flex flex-col gap-6">

                        {/* Dados do cliente */}
                        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                                Dados do Cliente
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-slate-500">Nome</p>
                                    <p className="text-sm font-medium text-white mt-0.5">{pedido.nomeCliente}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">CNPJ</p>
                                    <p className="text-sm font-mono text-slate-300 mt-0.5">
                                        {formatarCnpj(pedido.cnpjCliente)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Itens do pedido */}
                        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-700">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Itens do Pedido
                                </p>
                            </div>

                            {pedido.itens.length === 0 ? (
                                <div className="px-6 py-8 text-center text-slate-500 text-sm">
                                    Nenhum item neste pedido.
                                </div>
                            ) : (
                                <>
                                    {/* Header da tabela */}
                                    <div className="grid grid-cols-4 px-6 py-2 bg-slate-700/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        <span className="col-span-2">Produto</span>
                                        <span className="text-center">Quantidade</span>
                                        <span className="text-right">Subtotal</span>
                                    </div>

                                    {/* Linhas */}
                                    <div className="divide-y divide-slate-700">
                                        {pedido.itens.map((item) => (
                                            <div key={item.codProduto} className="grid grid-cols-4 px-6 py-4 items-center">
                                                <div className="col-span-2">
                                                    <p className="text-sm font-medium text-white">{item.nomeProduto}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        {formatarMoeda(item.precoUnitario)} / un.
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
                                                        {item.quantidade}x
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-sm font-semibold text-blue-400">
                                                        {formatarMoeda(item.subtotal)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Resumo financeiro */}
                    <div className="flex flex-col gap-4">
                        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-700">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Resumo
                                </p>
                            </div>

                            <div className="p-6 flex flex-col gap-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">Pedido</span>
                                    <span className="text-slate-300 font-mono">#{pedido.codPedido}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">Data</span>
                                    <span className="text-slate-300">{formatarData(pedido.dataPedido)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">Itens</span>
                                    <span className="text-slate-300">{pedido.itens.length} produto(s)</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">Quantidade total</span>
                                    <span className="text-slate-300">
                                        {pedido.itens.reduce((acc, i) => acc + i.quantidade, 0)} un.
                                    </span>
                                </div>

                                <div className="border-t border-slate-700 pt-3 mt-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-semibold text-slate-300">Total</span>
                                        <span className="text-xl font-bold text-blue-400">
                                            {formatarMoeda(pedido.valorTotal)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}