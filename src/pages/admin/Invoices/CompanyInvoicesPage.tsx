import { useNavigate, useParams } from "react-router";
import type { Invoice } from "../../../store/mainInvoiceApi";
import InvoiceListPage from "./MainInvoicesPage";

const CompanyInvoicesPage = () => {
    const navigate      = useNavigate();
    const { companyId } = useParams<{ companyId: string }>();
    const companyIdNum  = Number(companyId);

    if (!companyIdNum) return null;

    return (
        <InvoiceListPage
            companyId={companyIdNum}
            onCreateInvoice={() => navigate(`/dashboard/company/${companyId}/invoices/create`)}
            onEditInvoice={(invoice: Invoice) =>
                navigate(`/dashboard/company/${companyId}/invoices/${invoice.id}`)
            }
        />
    );
};

export default CompanyInvoicesPage;