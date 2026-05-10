"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Table } from "@/components/ui/Table";
import { pedidoService } from "@/services/pedido-service";
import { clienteService } from "@/services/cliente-service";
import { PedidoResponse } from "@/types";

export default function PedidosPage() {
  const router = useRouter();

  // ── Estado da listagem ──────────────────────────────────────
  const [pedidos, setPedidos] = useState<PedidoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  // ── Estado dos filtros ──────────────────────────────────────
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [cnpjFiltro, setCnpjFiltro] = useState("");

  // ── Estado do modal de criação ──────────────────────────────
  const [modalAberto, setModalAberto] = useState(false);
  const [cnpj, setCnpj] = useState("");
  const [erroCnpj, setErroCnpj] = useState("");
  const [criando, setCriando] = useState(false);

  // ── Busca pedidos ───────────────────────────────────────────
  const buscarPedidos = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      const data = await pedidoService.getAll({
        dataInicio: dataInicio || undefined,
        dataFim: dataFim || undefined,
        cnpj: cnpjFiltro || undefined,
      });
      setPedidos(data);
    } catch {
      setErro("Erro ao carregar pedidos.");
    } finally {
      setLoading(false);
    }
  }, [dataInicio, dataFim, cnpjFiltro]);

  useEffect(() => {
    buscarPedidos();
  }, [buscarPedidos]);

  // ── Limpar filtros ──────────────────────────────────────────
  function limparFiltros() {
    setDataInicio("");
    setDataFim("");
    setCnpjFiltro("");
  }

  // ── Criar pedido ────────────────────────────────────────────
  async function handleCriarPedido() {
    if (!cnpj.trim()) {
      setErroCnpj("Informe o CNPJ do cliente.");
      return;
    }

    setCriando(true);
    setErroCnpj("");

    try {
      // Valida se o cliente existe antes de criar
      await clienteService.getByCnpj(cnpj);

      const pedido = await pedidoService.create({ cnpj });
      setModalAberto(false);
      setCnpj("");
      router.push(`/novo-pedido?pedidoId=${pedido.codPedido}`);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setErroCnpj(e.message.includes("404") || e.message.includes("não encontrado")
          ? "Nenhum cliente encontrado com esse CNPJ."
          : e.message);
      }
    } finally {
      setCriando(false);
    }
  }

  function handleFecharModal() {
    setModalAberto(false);
    setCnpj("");
    setErroCnpj("");
  }

  // ── Formatações ─────────────────────────────────────────────
  function formatarData(data: string) {
    return new Date(data).toLocaleDateString("pt-BR");
  }

  function formatarValor(valor: number) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function formatarCnpj(cnpj: string) {
    return cnpj.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      "$1.$2.$3/$4-$5"
    );
  }

  return (
    <>
      <Header
        title="Pedidos"
        subtitle="Gerencie todos os pedidos da loja"
        actions={
          <Button onClick={() => setModalAberto(true)}>+ Novo Pedido</Button>
        }
      />

      <div className="p-8 flex flex-col gap-6">

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-600 mb-3">Filtrar pedidos</p>
          <div className="flex flex-wrap gap-3 items-end">
            <Input
              label="Data inicial"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-40"
            />
            <Input
              label="Data final"
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-40"
            />
            <Input
              label="CNPJ do cliente"
              placeholder="00.000.000/0000-00"
              mask="cnpj"
              value={cnpjFiltro}
              onChange={(e) => setCnpjFiltro(e.target.value)}
              className="w-52"
            />
            <Button variant="secondary" onClick={limparFiltros}>
              Limpar
            </Button>
          </div>
        </div>

        {/* Erro */}
        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {erro}
          </div>
        )}

        {/* Tabela */}
        <Table
          loading={loading}
          data={pedidos}
          keyExtractor={(p) => p.codPedido}
          onRowClick={(p) => router.push(`/pedidos/${p.codPedido}`)}
          emptyMessage="Nenhum pedido encontrado."
          columns={[
            { header: "#", accessor: (p) => `#${p.codPedido}`, className: "w-16" },
            { header: "Cliente", accessor: "nomeCliente" },
            { header: "CNPJ", accessor: (p) => formatarCnpj(p.cnpjCliente.replace(/\D/g, "")) },
            { header: "Data", accessor: (p) => formatarData(p.dataPedido) },
            { header: "Itens", accessor: (p) => `${p.itens.length} item(s)` },
            { header: "Total", accessor: (p) => formatarValor(p.valorTotal) },
            {
              header: "",
              accessor: (p) => (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/pedidos/${p.codPedido}`);
                  }}
                >
                  Ver detalhes →
                </Button>
              ),
            },
          ]}
        />
      </div>

      {/* Modal de criação de pedido */}
      <Modal
        open={modalAberto}
        title="Novo Pedido"
        onClose={handleFecharModal}
        footer={
          <>
            <Button variant="secondary" onClick={handleFecharModal}>
              Cancelar
            </Button>
            <Button loading={criando} onClick={handleCriarPedido}>
              Criar Pedido
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">
            Informe o CNPJ do cliente para criar um novo pedido.
            O cliente deve estar previamente cadastrado no sistema.
          </p>
          <Input
            label="CNPJ do cliente"
            placeholder="00.000.000/0000-00"
            mask="cnpj"
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            error={erroCnpj}
            autoFocus
          />
        </div>
      </Modal>
    </>
  );
}