export type AccountType = "bank" | "e_wallet" | "cash" | "investment" | "other"
export type CategoryType = "income" | "expense"
export type TransactionType = "income" | "expense" | "transfer"
export type BudgetPeriod = "weekly" | "monthly" | "yearly"
export type LoanDirection = "lent" | "borrowed"
export type FamilyRole = "owner" | "member"
export type InvestmentType = "stocks" | "mutual_fund" | "crypto" | "gold" | "deposit" | "other"
export type InvestmentAction = "buy" | "sell" | "dividend" | "top_up" | "withdraw"

export interface User {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Account {
  id: string
  user_id: string
  name: string
  type: AccountType
  balance: number
  currency: string
  icon: string | null
  is_active: boolean
  created_at: string
}

export interface Category {
  id: string
  user_id: string | null
  name: string
  type: CategoryType
  icon: string | null
  color: string | null
  parent_id: string | null
  is_default: boolean
}

export interface Transaction {
  id: string
  user_id: string
  account_id: string
  category_id: string | null
  type: TransactionType
  amount: number
  note: string | null
  transaction_date: string
  attachment_url: string | null
  created_at: string
}

export interface Transfer {
  id: string
  from_transaction_id: string
  to_transaction_id: string
  amount: number
  created_at: string
}

export interface Budget {
  id: string
  user_id: string
  category_id: string
  amount: number
  period: BudgetPeriod
  start_date: string
  end_date: string | null
}

export interface SavingsGoal {
  id: string
  user_id: string
  name: string
  target_amount: number
  current_amount: number
  target_date: string | null
  icon: string | null
  is_completed: boolean
  created_at: string
}

export interface SavingsContribution {
  id: string
  savings_goal_id: string
  transaction_id: string | null
  amount: number
  contributed_at: string
}

export interface Loan {
  id: string
  user_id: string
  contact_name: string
  direction: LoanDirection
  original_amount: number
  remaining_amount: number
  due_date: string | null
  note: string | null
  is_settled: boolean
  created_at: string
}

export interface LoanPayment {
  id: string
  loan_id: string
  transaction_id: string | null
  amount: number
  paid_at: string
  note: string | null
}

export interface Investment {
  id: string
  user_id: string
  name: string
  type: InvestmentType
  initial_amount: number
  current_value: number
  start_date: string
  platform: string | null
  note: string | null
  created_at: string
}

export interface InvestmentTransaction {
  id: string
  investment_id: string
  transaction_id: string | null
  action: InvestmentAction
  amount: number
  action_date: string
  note: string | null
}

export interface FamilyGroup {
  id: string
  name: string
  owner_id: string
  created_at: string
}

export interface FamilyMember {
  id: string
  family_group_id: string
  user_id: string
  role: FamilyRole
  joined_at: string
}

