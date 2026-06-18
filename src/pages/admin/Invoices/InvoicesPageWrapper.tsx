import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import MainInvoicesPage from "./MainInvoicesPage";
import type { Invoice } from "../../../store/mainInvoiceApi";

const InvoicesPageWrapper = () => {
    const navigate  = useNavigate();
    const companyId = useSelector((state: RootState) => state.auth.company_id);

    if (!companyId) return null;

    return (
        <MainInvoicesPage
            companyId={companyId}
            onCreateInvoice={() => navigate(`/dashboard/company/${companyId}/invoices/create`)}
            onEditInvoice={(invoice: Invoice) => navigate(`/dashboard/company/${companyId}/invoices/${invoice.id}`)}
        />
    );
};

export default InvoicesPageWrapper;