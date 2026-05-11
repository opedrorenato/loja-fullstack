"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Table } from "@/components/ui/Table";
import { clienteService } from "@/services/cliente-service";
import { ClienteResponse } from "@/types";

export default function ClientesPage() {
    const [clientes, setClientes] = useState<ClienteResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    // Form State
    const [nome, setNome] = useState("");
    const [cnpj, setCnpj] = useState("");
    const [email, setEmail] = useState("");
    const [erroCnpj, setErroCnpj] = useState("");
    const [erroEmail, setErroEmail] = useState("");

    // Modals
    const [modalNovoAberto, setModalNovoAberto] = useState(false);
    const [modalEditarAberto, setModalEditarAberto] = useState(false);
    const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
    
    const [clienteSelecionado, setClienteSelecionado] = useState<ClienteResponse | null>(null);
    const [processando, setProcessando] = useState(false);

    const carregarClientes = useCallback(async () => {
        setLoading(true);
        setErro("");
        try {
            const data = await clienteService.getAll();
            setClientes(data);
        } catch {
            setErro("Erro ao carregar clientes.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        carregarClientes();
    }, [carregarClientes]);

    function validarForm() {
        setErroCnpj("");
        setErroEmail("");
        let temErro = false;

        const cnpjLimpo = cnpj.replace(/\D/g, "");
        if (cnpjLimpo.length !== 14) {
            setErroCnpj("Por favor, insira um CNPJ válido.");
            temErro = true;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErroEmail("Por favor, insira um e-mail válido.");
            temErro = true;
        }

        if (!nome) temErro = true;

        return !temErro;
    }

    async function handleCriarCliente() {
        if (!validarForm()) return;

        setModalNovoAberto(false);
        setProcessando(true);
        setErro("");
        setSucesso("");

        try {
            const cnpjLimpo = cnpj.replace(/\D/g, "");
            await clienteService.create({ nome, cnpj: cnpjLimpo, email });
            setSucesso("Cliente criado com sucesso!");
            limparForm();
            carregarClientes();
        } catch (err: any) {
            setErro(err.message || "Erro ao criar cliente.");
        } finally {
            setProcessando(false);
        }
    }

    async function handleEditarCliente() {
        if (!clienteSelecionado || !validarForm()) return;

        setModalEditarAberto(false);
        setProcessando(true);
        setErro("");
        setSucesso("");

        try {
            await clienteService.update(clienteSelecionado.codCliente, { 
                nome, 
                cnpj: clienteSelecionado.cnpj, // CNPJ não muda
                email 
            });
            setSucesso("Cliente atualizado com sucesso!");
            limparForm();
            carregarClientes();
        } catch (err: any) {
            setErro(err.message || "Erro ao atualizar cliente.");
        } finally {
            setProcessando(false);
        }
    }

    async function handleExcluirCliente() {
        if (!clienteSelecionado) return;

        setModalExcluirAberto(false);
        setProcessando(true);
        setErro("");
        setSucesso("");

        try {
            await clienteService.delete(clienteSelecionado.codCliente);
            setSucesso("Cliente removido com sucesso!");
            setClienteSelecionado(null);
            carregarClientes();
        } catch (err: any) {
            setErro(err.message || "Erro ao excluir cliente.");
        } finally {
            setProcessando(false);
        }
    }

    function limparForm() {
        setNome("");
        setCnpj("");
        setEmail("");
        setErroCnpj("");
        setErroEmail("");
        setClienteSelecionado(null);
    }

    function handleAbrirEdicao(cliente: ClienteResponse) {
        setClienteSelecionado(cliente);
        setNome(cliente.nome);
        setCnpj(formatarCnpj(cliente.cnpj));
        setEmail(cliente.email);
        setErroCnpj("");
        setErroEmail("");
        setModalEditarAberto(true);
    }

    function handleAbrirExclusao(cliente: ClienteResponse) {
        setClienteSelecionado(cliente);
        setModalExcluirAberto(true);
    }

    function formatarData(data: string) {
        return new Date(data).toLocaleDateString("pt-BR");
    }

    function formatarCnpj(cnpj: string) {
        return cnpj.replace(/\D/g, "")
            .replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
    }

    return (
        <>
            <Header
                title="Clientes"
                subtitle="Gerencie o cadastro de clientes da loja"
                actions={
                    <Button onClick={() => { limparForm(); setModalNovoAberto(true); }}>
                        + Novo Cliente
                    </Button>
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
                            {loading ? "Carregando..." : `${clientes.length} cliente(s) encontrado(s)`}
                        </p>
                    </div>

                    <Table
                        loading={loading}
                        data={clientes}
                        keyExtractor={(c) => c.codCliente}
                        emptyMessage="Nenhum cliente encontrado."
                        columns={[
                            {
                                header: "#",
                                accessor: (c) => (
                                    <span className="font-mono text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                                        #{c.codCliente}
                                    </span>
                                ),
                                className: "w-16",
                            },
                            {
                                header: "Nome",
                                accessor: (c) => (
                                    <span className="font-medium text-slate-200">{c.nome}</span>
                                ),
                            },
                            {
                                header: "CNPJ",
                                accessor: (c) => (
                                    <span className="font-mono text-xs text-slate-400">{formatarCnpj(c.cnpj)}</span>
                                ),
                            },
                            {
                                header: "E-mail",
                                accessor: (c) => (
                                    <span className="text-slate-300">{c.email}</span>
                                ),
                            },
                            {
                                header: "Cadastro",
                                accessor: (c) => (
                                    <span className="text-slate-400 text-sm">{formatarData(c.dataCadastro)}</span>
                                ),
                            },
                            {
                                header: "Ações",
                                accessor: (c) => (
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleAbrirEdicao(c)}
                                        >
                                            ✏️
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                            onClick={() => handleAbrirExclusao(c)}
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

            {/* Modal Novo Cliente */}
            <Modal
                open={modalNovoAberto}
                title="Novo Cliente"
                onClose={() => setModalNovoAberto(false)}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setModalNovoAberto(false)}>Cancelar</Button>
                        <Button loading={processando} onClick={handleCriarCliente}>Salvar Cliente</Button>
                    </>
                }
            >
                <div className="flex flex-col gap-4">
                    <Input
                        label="Nome do Cliente"
                        placeholder="Ex: Empresa Exemplo LTDA"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                    />
                    <Input
                        label="CNPJ"
                        placeholder="00.000.000/0000-00"
                        mask="cnpj"
                        value={cnpj}
                        onChange={(e) => {
                            setCnpj(e.target.value);
                            setErroCnpj("");
                        }}
                        error={erroCnpj}
                    />
                    <Input
                        label="E-mail"
                        type="email"
                        placeholder="contato@empresa.com"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setErroEmail("");
                        }}
                        error={erroEmail}
                    />
                </div>
            </Modal>

            {/* Modal Editar Cliente */}
            <Modal
                open={modalEditarAberto}
                title="Editar Cliente"
                onClose={() => setModalEditarAberto(false)}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setModalEditarAberto(false)}>Cancelar</Button>
                        <Button loading={processando} onClick={handleEditarCliente}>Salvar Alterações</Button>
                    </>
                }
            >
                <div className="flex flex-col gap-4">
                    <Input
                        label="Nome do Cliente"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                    />
                    <Input
                        label="CNPJ (Não pode ser alterado)"
                        mask="cnpj"
                        value={cnpj}
                        disabled
                    />
                    <Input
                        label="E-mail"
                        type="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setErroEmail("");
                        }}
                        error={erroEmail}
                    />
                </div>
            </Modal>

            {/* Modal Excluir Cliente */}
            <Modal
                open={modalExcluirAberto}
                title="Excluir Cliente"
                onClose={() => setModalExcluirAberto(false)}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setModalExcluirAberto(false)}>Cancelar</Button>
                        <Button variant="ghost" className="bg-red-600 hover:bg-red-700 text-white" loading={processando} onClick={handleExcluirCliente}>Excluir permanentemente</Button>
                    </>
                }
            >
                <div className="flex flex-col gap-4">
                    <p className="text-slate-300">
                        Tem certeza que deseja excluir o cliente <span className="font-bold text-white">{clienteSelecionado?.nome}</span>?
                    </p>
                    <p className="text-sm text-red-400">
                        Esta ação não pode ser desfeita e todos os dados associados serão perdidos.
                    </p>
                </div>
            </Modal>
        </>
    );
}
