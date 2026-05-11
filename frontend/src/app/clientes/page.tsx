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

    // Modal Novo Cliente
    const [modalAberto, setModalAberto] = useState(false);
    const [nome, setNome] = useState("");
    const [cnpj, setCnpj] = useState("");
    const [email, setEmail] = useState("");
    const [erroCnpj, setErroCnpj] = useState("");
    const [erroEmail, setErroEmail] = useState("");
    const [sucesso, setSucesso] = useState("");
    const [criando, setCriando] = useState(false);

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

    async function handleCriarCliente() {
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

        if (temErro || !nome) return;

        setModalAberto(false);
        setCriando(true);
        setErro("");
        setSucesso("");

        try {
            await clienteService.create({ nome, cnpj: cnpjLimpo, email });
            setSucesso("Cliente criado com sucesso!");
            setNome("");
            setCnpj("");
            setEmail("");
            carregarClientes();
        } catch (err: any) {
            setErro(err.message || "Erro ao criar cliente.");
        } finally {
            setCriando(false);
        }
    }

    function handleFecharModal() {
        setModalAberto(false);
        setNome("");
        setCnpj("");
        setEmail("");
        setErroCnpj("");
        setErroEmail("");
        setErro("");
        setSucesso("");
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
                    <Button onClick={() => setModalAberto(true)}>+ Novo Cliente</Button>
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
                                className: "text-right",
                            },
                        ]}
                    />
                </div>
            </div>

            {/* Modal Novo Cliente */}
            <Modal
                open={modalAberto}
                title="Novo Cliente"
                onClose={handleFecharModal}
                footer={
                    <>
                        <Button variant="secondary" onClick={handleFecharModal}>Cancelar</Button>
                        <Button loading={criando} onClick={handleCriarCliente}>Salvar Cliente</Button>
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
        </>
    );
}
