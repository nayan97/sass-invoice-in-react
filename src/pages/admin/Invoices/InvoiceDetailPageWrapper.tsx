import { useNavigate, useParams } from "react-router";
import InvoiceDetailPage from "./InvoiceDetailPage";

const InvoiceDetailPageWrapper = () => {
    const navigate               = useNavigate();
    const { companyId, invoiceId } = useParams<{ companyId: string; invoiceId: string }>();
    const companyIdNum           = Number(companyId);
    const invoiceIdNum           = Number(invoiceId);

    if (!companyIdNum || !invoiceIdNum) return null;

    return (
        <InvoiceDetailPage
            companyId={companyIdNum}
            invoiceId={invoiceIdNum}
            onBack={() => navigate(`/dashboard/company/${companyId}/invoices`)}
            onEdit={(id) => navigate(`/dashboard/company/${companyId}/invoices/${id}/edit`)}
        />
    );
};

export default InvoiceDetailPageWrapper;