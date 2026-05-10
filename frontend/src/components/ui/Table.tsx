interface Column<T> {
    header: string;
    accessor: keyof T | ((row: T) => React.ReactNode);
    className?: string;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyExtractor: (row: T) => string | number;
    onRowClick?: (row: T) => void;
    emptyMessage?: string;
    loading?: boolean;
}

export function Table<T>({
    columns,
    data,
    keyExtractor,
    onRowClick,
    emptyMessage = "Nenhum registro encontrado.",
    loading = false,
}: TableProps<T>) {
    return (
        <div className="w-full overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                    <tr>
                        {columns.map((col, i) => (
                            <th
                                key={i}
                                className={`px-4 py-3 text-left font-medium ${col.className ?? ""}`}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr>
                            <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">
                                <span className="inline-block w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((row) => (
                            <tr
                                key={keyExtractor(row)}
                                onClick={() => onRowClick?.(row)}
                                className={`bg-white transition-colors ${onRowClick ? "cursor-pointer hover:bg-blue-50" : ""
                                    }`}
                            >
                                {columns.map((col, i) => (
                                    <td key={i} className={`px-4 py-3 text-gray-700 ${col.className ?? ""}`}>
                                        {typeof col.accessor === "function"
                                            ? col.accessor(row)
                                            : String(row[col.accessor] ?? "")}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}