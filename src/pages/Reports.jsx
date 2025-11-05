import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const mockExpenses = [
  { id: '1', title: 'Salary', amount: 50000, category: 'Salary', type: 'Income', date: '2024-07-01' },
  { id: '2', title: 'Groceries', amount: 1500, category: 'Food', type: 'Expense', date: '2024-07-02' },
  { id: '3', title: 'Petrol', amount: 800, category: 'Transportation', type: 'Expense', date: '2024-06-20' },
  { id: '4', title: 'Restaurant', amount: 1200, category: 'Food', type: 'Expense', date: '2024-06-10' },
  { id: '5', title: 'Freelance', amount: 8000, category: 'Freelance', type: 'Income', date: '2024-05-18' },
  { id: '6', title: 'Rent', amount: 12000, category: 'Housing', type: 'Expense', date: '2023-12-01' },
  { id: '7', title: 'Utilities', amount: 2000, category: 'Utilities', type: 'Expense', date: '2023-12-20' },
  { id: '8', title: 'Shopping', amount: 3000, category: 'Shopping', type: 'Expense', date: '2023-07-22' },
];

export default function Reports() {
  const [expenses, setExpenses] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [reportData, setReportData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netIncome: 0,
    categoryBreakdown: {},
    topCategories: [],
  });

  useEffect(() => {
    const filtered = filterByPeriod(mockExpenses);
    setExpenses(filtered);
    generateReport(filtered);
  }, [selectedPeriod]);

  const filterByPeriod = (allExpenses) => {
    const now = new Date();
    return allExpenses.filter((exp) => {
      const date = new Date(exp.date);
      switch (selectedPeriod) {
        case 'current-month':
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        case 'last-month': {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
        }
        case 'current-year':
          return date.getFullYear() === now.getFullYear();
        case 'last-year':
          return date.getFullYear() === now.getFullYear() - 1;
        case 'all-time':
        default:
          return true;
      }
    });
  };

  const generateReport = (expenseData) => {
    const income = expenseData.filter(e => e.type === 'Income').reduce((sum, e) => sum + e.amount, 0);
    const totalExpenses = expenseData.filter(e => e.type === 'Expense').reduce((sum, e) => sum + e.amount, 0);

    const categoryBreakdown = expenseData.reduce((acc, expense) => {
      if (expense.type === 'Expense') {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      }
      return acc;
    }, {});

    const topCategories = Object.entries(categoryBreakdown)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / totalExpenses) * 100,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    setReportData({
      totalIncome: income,
      totalExpenses,
      netIncome: income - totalExpenses,
      categoryBreakdown,
      topCategories,
    });
  };

  const exportToCSV = () => {
    const csvHeaders = ['Date', 'Title', 'Category', 'Type', 'Amount (₹)'];
    const csvData = expenses.map((expense) => [
      expense.date,
      expense.title,
      expense.category,
      expense.type,
      expense.amount.toString(),
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map((row) => row.map((field) => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `expenses-report-${selectedPeriod}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    toast.success('Report exported successfully!');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header and Export */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground">Export and analyze your financial data</p>
          </div>
          <Button onClick={exportToCSV} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Period Select */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Report Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-month">Current Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="current-year">Current Year</SelectItem>
                <SelectItem value="last-year">Last Year</SelectItem>
                <SelectItem value="all-time">All Time</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Summary + Breakdown */}
        {/* You can continue the layout for summaries, charts, etc., below */}
      </div>
    </div>
  );
}
