
import { formatCurrency } from "../../utils/format-currency";
import { capitalizeFirstLetter } from "../../utils/helper";
import {ReportType} from "../report_mailer"
export const getReportEmailTemplate = (
    reportData: ReportType & {
        username:string},
        frequency:string
    
) => {
    const{
    username,
        period,
        totalIncome,
        availableBalance,
        savingsRate,
        topSpendingCategories,
        insights,
    } = reportData;

    const reportTitle = `${capitalizeFirstLetter} Report`

   
    const categoryList = topSpendingCategories.map((cat:
        any) => `<li>
     ${cat.name} - ${formatCurrency(cat.amount)} (${cat.
        percent}%)
        </li>`)
        .join("");

        const insightsList = insights.map((insight:string) =>
        `<li>${insight}</li>`)
        .join("");

        const currentYear = new Date().getFullYear();
        return`
        
    };
