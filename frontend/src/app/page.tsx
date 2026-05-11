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
import { PedidoResponse, ClienteResponse } from "@/types";

export default function PedidosPage() {
  const router = useRouter();

  const [pedidos, setPedidos] = useState<PedidoResponse[]>([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState<PedidoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [cnpjFiltro, setCnpjFiltro] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [cnpj, setCnpj] = useState("");
  const [erroCnpj, setErroCnpj] = useState("");
  const [criando, setCriando] = useState(false); // TO-DO: REMOVER?

  const [clientes, setClientes] = useState<ClienteResponse[]>([]);
  const [clientesFiltrados, setClientesFiltrados] = useState<ClienteResponse[]>([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);

  const buscarPedidos = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      const [pedidosData, clientesData] = await Promise.all([
        pedidoService.getAll({
          dataInicio: dataInicio || undefined,
          dataFim: dataFim || undefined,
        }),
        clienteService.getAll(),
      ]);
      setPedidos(pedidosData);
      setClientes(clientesData);
    } catch {
      setErro("Erro ao carregar pedidos.");
    } finally {
      setLoading(false);
    }
  }, [dataInicio, dataFim]);

  useEffect(() => {
    buscarPedidos();
  }, [buscarPedidos]);

  useEffect(() => {
    if (!cnpj.trim()) {
      setClientesFiltrados([]);
      return;
    }
    const termo = cnpj.replace(/\D/g, "");
    setClientesFiltrados(
      clientes.filter((c) => c.cnpj.replace(/\D/g, "").includes(termo))
    );
  }, [cnpj, clientes]);

  // Filtro de CNPJ em memória
  useEffect(() => {
    if (!cnpjFiltro.trim()) {
      setPedidosFiltrados(pedidos);
      return;
    }
    const termo = cnpjFiltro.replace(/\D/g, "");
    setPedidosFiltrados(
      pedidos.filter((p) =>
        p.cnpjCliente.replace(/\D/g, "").includes(termo)
      )
    );
  }, [cnpjFiltro, pedidos]);

  function limparFiltros() {
    setDataInicio("");
    setDataFim("");
    setCnpjFiltro("");
  }

  async function handleCriarPedido() {
    if (!cnpj.trim()) {
      setErroCnpj("Informe o CNPJ do cliente.");
      return;
    }

    const clienteEncontrado = clientes.find(
      (c) => c.cnpj.replace(/\D/g, "") === cnpj.replace(/\D/g, "")
    );

    if (!clienteEncontrado) {
      setErroCnpj("Nenhum cliente encontrado com esse CNPJ.");
      return;
    }

    setModalAberto(false);
    setCnpj("");
    router.push(`/novo-pedido?cnpj=${encodeURIComponent(clienteEncontrado.cnpj)}`);
  }

  function handleFecharModal() {
    setModalAberto(false);
    setCnpj("");
    setErroCnpj("");
  }

  function formatarData(data: string) {
    return new Date(data).toLocaleDateString("pt-BR");
  }

  function formatarValor(valor: number) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-slate-300">🔍 Filtrar pedidos</p>
            {(dataInicio || dataFim || cnpjFiltro) && (
              <button
                onClick={limparFiltros}
                className="text-xs text-blue-400 hover:underline"
              >
                Limpar filtros
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-3 items-end">
            <Input
              label="Data inicial"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-44"
            />
            <Input
              label="Data final"
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-44"
            />
            <Input
              label="CNPJ do cliente"
              placeholder="Digite para filtrar..."
              mask="cnpj"
              value={cnpjFiltro}
              onChange={(e) => setCnpjFiltro(e.target.value)}
              className="w-56"
            />
          </div>
        </div>

        {/* Erro */}
        {erro && (
          <div className="bg-red-900/40 border border-red-700 text-red-400 rounded-lg px-4 py-3 text-sm">
            {erro}
          </div>
        )}

        {/* Tabela */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700">
            <p className="text-sm font-semibold text-slate-300">
              {loading ? "Carregando..." : `${pedidosFiltrados.length} pedido(s) encontrado(s)`}
            </p>
          </div>
          <Table
            loading={loading}
            data={pedidosFiltrados}
            keyExtractor={(p) => p.codPedido}
            onRowClick={(p) => router.push(`/pedidos/${p.codPedido}`)}
            emptyMessage="Nenhum pedido encontrado."
            columns={[
              {
                header: "#",
                accessor: (p) => (
                  <span className="font-mono text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                    #{p.codPedido}
                  </span>
                ),
                className: "w-16",
              },
              {
                header: "Cliente",
                accessor: (p) => (
                  <span className="font-medium text-slate-200">{p.nomeCliente}</span>
                ),
              },
              {
                header: "CNPJ",
                accessor: (p) => (
                  <span className="font-mono text-xs text-slate-400">{p.cnpjCliente}</span>
                ),
              },
              {
                header: "Data",
                accessor: (p) => formatarData(p.dataPedido),
              },
              {
                header: "Total",
                accessor: (p) => (
                  <span className="font-semibold text-blue-400">
                    {formatarValor(p.valorTotal)}
                  </span>
                ),
              },
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
      </div>

      {/* Modal */}
      <Modal
        open={modalAberto}
        title="Novo Pedido"
        onClose={handleFecharModal}
        footer={
          <>
            <Button variant="secondary" onClick={handleFecharModal}>Cancelar</Button>
            <Button loading={criando} onClick={handleCriarPedido}>Criar Pedido</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-400">
            Informe o CNPJ do cliente para criar um novo pedido.
            O cliente deve estar previamente cadastrado no sistema.
          </p>

          <div className="relative">
            <Input
              label="CNPJ do cliente"
              placeholder="00.000.000/0000-00"
              mask="cnpj"
              value={cnpj}
              onChange={(e) => {
                setCnpj(e.target.value);
                setMostrarSugestoes(true);
                setErroCnpj("");
              }}
              onFocus={() => setMostrarSugestoes(true)}
              onBlur={() => setTimeout(() => setMostrarSugestoes(false), 150)}
              error={erroCnpj}
              autoFocus
            />

            {/* Dropdown de sugestões */}
            {mostrarSugestoes && clientesFiltrados.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-xl overflow-hidden">
                {clientesFiltrados.map((c) => (
                  <button
                    key={c.codCliente}
                    onMouseDown={() => {
                      setCnpj(c.cnpj);
                      setMostrarSugestoes(false);
                      setErroCnpj("");
                    }}
                    className="w-full px-4 py-2.5 text-left hover:bg-slate-600 transition-colors"
                  >
                    <p className="text-sm font-medium text-white">{c.nome}</p>
                    <p className="text-xs text-slate-400 font-mono">{c.cnpj}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}