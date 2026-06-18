import { useNavigate, useParams } from "react-router";
import AddInvoicePage from "./AddInvoicePage";

const AddInvoicePageWrapper = () => {
    const navigate            = useNavigate();
    const { companyId }       = useParams<{ companyId: string }>();
    const companyIdNum        = Number(companyId);

    if (!companyIdNum) return null;

    return (
        <AddInvoicePage
            companyId={companyIdNum}
            invoiceNo=""  // backend auto-generate করবে, খালি রাখো
            onBack={() => navigate(`/dashboard/company/${companyId}/invoices`)}
            onSuccess={() => navigate(`/dashboard/company/${companyId}/invoices`)}
        />
    );
};

export default AddInvoicePageWrapper;