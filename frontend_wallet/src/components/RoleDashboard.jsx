import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../utils/api";
import WithdrawModal from "./Withdraw/WithdrawModal";
import DepositModal from "./Deposit/DepositModal";
import "./role-dashboard.css";

const INDIA_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const KYC_DOCUMENT_TYPES = ["Aadhaar", "PAN", "Passport", "Driving License", "Voter ID"];

const RECHARGE_SERVICES = [
  { key: "prepaid-postpaid", label: "Prepaid/Postpaid", symbol: "📱" },
  { key: "electricity", label: "Electricity", symbol: "💡" },
  { key: "dth", label: "DTH", symbol: "📡" },
  { key: "metro", label: "Metro", symbol: "🚇" },
  { key: "broadband", label: "Broadband", symbol: "🌐" },
  { key: "education", label: "Education", symbol: "🎓" },
  { key: "pay-loan", label: "Pay Loan", symbol: "💳" },
  { key: "insurance", label: "Insurance", symbol: "🛡️" },
];

const RECHARGE_OPERATORS = [
  { key: "Airtel", title: "Airtel Recharge", mark: "airtel", color: "#ffffff", textColor: "#e7202c", logoClass: "airtel" },
  { key: "BSNL", title: "BSNL Recharge", mark: "BSNL", color: "#eef1f4", textColor: "#2f3b4e", logoClass: "bsnl" },
  { key: "Jio", title: "Jio Recharge", mark: "Jio", color: "#0a63c9", textColor: "#ffffff", logoClass: "jio" },
  { key: "MTNL", title: "MTNL Recharge", mark: "MTNL", color: "#ffffff", textColor: "#158053", logoClass: "mtnl" },
  { key: "Vi", title: "Vi Recharge", mark: "VI", color: "#ea1f43", textColor: "#ffffff", logoClass: "vi" },
];

const ELECTRICITY_BOARD_OPTIONS = [
  "Andhra Pradesh Central Power Distribution Corporation LTD (APCPDCL)",
  "Andhra Pradesh Central Power (APCPDCL)",
  "TTD Electricity",
  "Tirumala Tirupati Devasthanams (TTD)",
];

const DTH_OPERATORS = [
  { key: "Tata Play (Formerly Tata Sky)", title: "Tata Play (Formerly Tata Sky) Recharge", mark: "TATA", color: "#ffffff", textColor: "#111827", logoClass: "dth-tata" },
  { key: "Airtel Digital TV", title: "Airtel Digital TV Recharge", mark: "airtel", color: "#eb1f2c", textColor: "#ffffff", logoClass: "dth-airtel" },
  { key: "Sun Direct", title: "Sun Direct Recharge", mark: "SUN", color: "#ffffff", textColor: "#f97316", logoClass: "dth-sun" },
  { key: "Dish TV", title: "Dish TV Recharge", mark: "dish", color: "#ffffff", textColor: "#f97316", logoClass: "dth-dish" },
  { key: "d2h", title: "d2h Recharge", mark: "d2h", color: "#6d28d9", textColor: "#ffffff", logoClass: "dth-d2h" },
];

const METRO_OPERATORS = [
  { key: "Delhi Metro", title: "Delhi Metro Recharge", mark: "DM", color: "#ffffff", textColor: "#1d4ed8", logoClass: "metro-delhi" },
  { key: "Mumbai Metro", title: "Mumbai Metro Recharge", mark: "MM", color: "#ffffff", textColor: "#059669", logoClass: "metro-mumbai" },
  { key: "Hyderabad Metro", title: "Hyderabad Metro Recharge", mark: "HM", color: "#ffffff", textColor: "#be185d", logoClass: "metro-hyderabad" },
  { key: "Bengaluru Metro", title: "Bengaluru Metro Recharge", mark: "BM", color: "#ffffff", textColor: "#7c3aed", logoClass: "metro-bengaluru" },
];

const BROADBAND_PROVIDERS = [
  { key: "Airtel Xstream", title: "Airtel Xstream", mark: "airtel", color: "#eb1f2c", textColor: "#ffffff", logoClass: "broadband-airtel" },
  { key: "JioFiber", title: "JioFiber", mark: "Jio", color: "#0a63c9", textColor: "#ffffff", logoClass: "broadband-jio" },
  { key: "BSNL Broadband", title: "BSNL Broadband", mark: "BSNL", color: "#eef1f4", textColor: "#2f3b4e", logoClass: "broadband-bsnl" },
  { key: "ACT Fibernet", title: "ACT Fibernet", mark: "ACT", color: "#ffffff", textColor: "#e11d48", logoClass: "broadband-act" },
];

const EDUCATION_INSTITUTES = [
  { key: "School Fees", title: "School Fees", mark: "SCH", color: "#ffffff", textColor: "#2563eb", logoClass: "education-school" },
  { key: "College Fees", title: "College Fees", mark: "COL", color: "#ffffff", textColor: "#4f46e5", logoClass: "education-college" },
  { key: "Exam Fees", title: "Exam Fees", mark: "EXM", color: "#ffffff", textColor: "#059669", logoClass: "education-exam" },
  { key: "Coaching Fees", title: "Coaching Fees", mark: "COA", color: "#ffffff", textColor: "#d97706", logoClass: "education-coaching" },
];

const INSURANCE_PROVIDERS = [
  { key: "LIC", title: "LIC Premium", mark: "LIC", color: "#ffffff", textColor: "#1d4ed8", logoClass: "insurance-lic" },
  { key: "HDFC Life", title: "HDFC Life", mark: "HDFC", color: "#ffffff", textColor: "#be123c", logoClass: "insurance-hdfc" },
  { key: "ICICI Prudential", title: "ICICI Prudential", mark: "ICICI", color: "#ffffff", textColor: "#ea580c", logoClass: "insurance-icici" },
  { key: "SBI Life", title: "SBI Life", mark: "SBI", color: "#ffffff", textColor: "#0369a1", logoClass: "insurance-sbi" },
];

const LOAN_PROVIDERS = [
  { key: "Bajaj Finance", title: "Bajaj Finance EMI", mark: "BF", color: "#ffffff", textColor: "#1d4ed8", logoClass: "loan-bajaj" },
  { key: "HDB Financial", title: "HDB Financial EMI", mark: "HDB", color: "#ffffff", textColor: "#b91c1c", logoClass: "loan-hdb" },
  { key: "TVS Credit", title: "TVS Credit EMI", mark: "TVS", color: "#ffffff", textColor: "#0f766e", logoClass: "loan-tvs" },
  { key: "Tata Capital", title: "Tata Capital EMI", mark: "TATA", color: "#ffffff", textColor: "#111827", logoClass: "loan-tata" },
];

const RECHARGE_QUICK_AMOUNTS = [149, 199, 239, 299, 399, 666];

const RECHARGE_PLAN_SUGGESTIONS = {
  Airtel: [
    { amount: 199, validity: "28 Days", benefits: "2 GB • Unlimited Calls" },
    { amount: 299, validity: "28 Days", benefits: "1.5 GB/day • Unlimited Calls" },
    { amount: 666, validity: "77 Days", benefits: "1.5 GB/day • OTT Bundle" },
  ],
  Jio: [
    { amount: 239, validity: "28 Days", benefits: "1.5 GB/day • Unlimited Calls" },
    { amount: 299, validity: "28 Days", benefits: "2 GB/day • Unlimited Calls" },
    { amount: 399, validity: "56 Days", benefits: "2.5 GB/day • OTT Bundle" },
  ],
  Vi: [
    { amount: 199, validity: "18 Days", benefits: "1 GB/day • Unlimited Calls" },
    { amount: 299, validity: "28 Days", benefits: "1.5 GB/day • Weekend Data" },
    { amount: 399, validity: "56 Days", benefits: "2 GB/day • Binge All Night" },
  ],
  BSNL: [
    { amount: 149, validity: "30 Days", benefits: "1 GB/day • Voice Calls" },
    { amount: 299, validity: "30 Days", benefits: "3 GB/day • Unlimited Calls" },
    { amount: 399, validity: "60 Days", benefits: "2 GB/day • Voice + SMS" },
  ],
  MTNL: [
    { amount: 149, validity: "28 Days", benefits: "1 GB/day • Voice Calls" },
    { amount: 239, validity: "30 Days", benefits: "1.5 GB/day • Voice Calls" },
    { amount: 299, validity: "45 Days", benefits: "2 GB/day • Voice + SMS" },
  ],
};

const formatCurrency = (amount) =>
  `\u20B9${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const ROLE_LABELS = {
  admin: "Admin",
  master_distributor: "Master Distributor",
  super_distributor: "Super Distributor",
  distributor: "Distributor",
  retailer: "Retailer",
};

const COMPANY_NAME = "XENN TECH";
const COMPANY_TAGLINE = "Wallet Admin";

const toProfileImageUrl = (value) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value) || value.startsWith("data:image")) return value;
  const normalized = String(value).replace(/^\/+/, "").replace(/^storage\//, "");
  return `/storage/${normalized}`;
};

const getInitials = (name) => {
  const cleanName = String(name || "").trim();
  if (!cleanName) return "U";
  const tokens = cleanName.split(/\s+/).filter(Boolean);
  return tokens
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase() || "")
    .join("") || "U";
};

const RoleDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [masterDistributorData, setMasterDistributorData] = useState(null);
  const [superDistributorData, setSuperDistributorData] = useState(null);
  const [distributorData, setDistributorData] = useState(null);
  const [distributorPerformance, setDistributorPerformance] = useState(null);
  const [distributorWithdrawRequests, setDistributorWithdrawRequests] = useState([]);
  const [selectedRetailerTransactions, setSelectedRetailerTransactions] = useState(null);
  const [retailerCommissionDraft, setRetailerCommissionDraft] = useState({});
  const [withdrawRemarksDraft, setWithdrawRemarksDraft] = useState({});
  const [newRetailer, setNewRetailer] = useState({
    name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirmation: "",
    date_of_birth: "",
    phone: "",
    alternate_mobile: "",
    business_name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gst_number: "",
    kyc_document_type: "",
    kyc_id_number: "",
    profile_photo: null,
    kyc_photo: null,
    address_proof_front: null,
    address_proof_back: null,
    bank_account_name: "",
    bank_account_number: "",
    bank_ifsc_code: "",
    bank_name: "",
    admin_commission: "",
    distributor_commission: "",
    mobility_check: "low",
  });
  const [retailerImagePreview, setRetailerImagePreview] = useState({
    profile_photo: "",
    address_proof_front: "",
    address_proof_back: "",
  });
  const [newDistributor, setNewDistributor] = useState({
    name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirmation: "",
    date_of_birth: "",
    phone: "",
    alternate_mobile: "",
    business_name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gst_number: "",
    kyc_document_type: "",
    kyc_id_number: "",
    profile_photo: null,
    kyc_photo: null,
    address_proof_front: null,
    address_proof_back: null,
    bank_account_name: "",
    bank_account_number: "",
    bank_ifsc_code: "",
    bank_name: "",
    admin_commission: "",
    distributor_commission: "",
    mobility_check: "low",
  });
  const [retailerCreateStep, setRetailerCreateStep] = useState(1);
  const [distributorCreateStep, setDistributorCreateStep] = useState(1);
  const [distributorImagePreview, setDistributorImagePreview] = useState({
    profile_photo: "",
    address_proof_front: "",
    address_proof_back: "",
  });
  const [adminTransferForm, setAdminTransferForm] = useState({
    from_wallet_id: "",
    to_wallet_id: "",
    amount: "",
    description: "",
  });
  const [retailerDashboard, setRetailerDashboard] = useState(null);
  const [retailerWithdrawRequests, setRetailerWithdrawRequests] = useState([]);
  const [retailerNotifications, setRetailerNotifications] = useState([]);
  const [transactionFilters, setTransactionFilters] = useState({
    type: "",
    start_date: "",
    end_date: "",
  });
  const [retailerPayinSearch, setRetailerPayinSearch] = useState("");
  const [retailerPayoutSearch, setRetailerPayoutSearch] = useState("");
  const [retailerPayinStatusFilter, setRetailerPayinStatusFilter] = useState("all");
  const [retailerPayoutStatusFilter, setRetailerPayoutStatusFilter] = useState("all");
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    date_of_birth: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [bankForm, setBankForm] = useState({
    bank_account_name: "",
    bank_account_number: "",
    bank_ifsc_code: "",
    bank_name: "",
  });
  const [kycFile, setKycFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [retailerTransactionTab, setRetailerTransactionTab] = useState("payouts");
  const [userManagementTab, setUserManagementTab] = useState("users");
  const [walletActionTab, setWalletActionTab] = useState("deposit");
  const [rechargeType, setRechargeType] = useState("prepaid");
  const [selectedRechargeService, setSelectedRechargeService] = useState("prepaid-postpaid");
  const [rechargeOperator, setRechargeOperator] = useState("");
  const [rechargeCircle, setRechargeCircle] = useState("Andhra Pradesh");
  const [rechargeOperatorSearch, setRechargeOperatorSearch] = useState("");
  const [rechargeMobile, setRechargeMobile] = useState("");
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [electricityBillType, setElectricityBillType] = useState("apartments");
  const [electricityState, setElectricityState] = useState("Andhra Pradesh");
  const [electricityBoard, setElectricityBoard] = useState(ELECTRICITY_BOARD_OPTIONS[0]);
  const [electricityCity, setElectricityCity] = useState("");
  const [electricityApartment, setElectricityApartment] = useState("");
  const [electricityFlatNo, setElectricityFlatNo] = useState("");
  const [electricityMobile, setElectricityMobile] = useState("");
  const [electricityServiceNumber, setElectricityServiceNumber] = useState("");
  const [dthOperator, setDthOperator] = useState(DTH_OPERATORS[0].key);
  const [dthSubscriberId, setDthSubscriberId] = useState("");
  const [dthOperatorPickerOpen, setDthOperatorPickerOpen] = useState(false);
  const [metroOperator, setMetroOperator] = useState(METRO_OPERATORS[0].key);
  const [metroCardNumber, setMetroCardNumber] = useState("");
  const [metroAmount, setMetroAmount] = useState("");
  const [broadbandProvider, setBroadbandProvider] = useState(BROADBAND_PROVIDERS[0].key);
  const [broadbandAccountId, setBroadbandAccountId] = useState("");
  const [broadbandMobile, setBroadbandMobile] = useState("");
  const [broadbandAmount, setBroadbandAmount] = useState("");
  const [educationInstitute, setEducationInstitute] = useState(EDUCATION_INSTITUTES[0].key);
  const [educationStudentId, setEducationStudentId] = useState("");
  const [educationAmount, setEducationAmount] = useState("");
  const [insuranceProvider, setInsuranceProvider] = useState(INSURANCE_PROVIDERS[0].key);
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState("");
  const [insuranceMobile, setInsuranceMobile] = useState("");
  const [insuranceAmount, setInsuranceAmount] = useState("");
  const [loanProvider, setLoanProvider] = useState(LOAN_PROVIDERS[0].key);
  const [loanAccountNumber, setLoanAccountNumber] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [inlineDeposit, setInlineDeposit] = useState({
    customer_name: "",
    mobile: "",
    email: "",
    amount: "",
    category: "education",
    transaction_date: new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
  });
  const [inlineWithdraw, setInlineWithdraw] = useState({
    payment_mode: "IMPS",
    amount: "",
    account_number: "",
    ifsc_code: "",
    account_holder_name: "",
    beneficiary_mobile: "",
    account_type: "Savings Account",
  });
  const [walletActionLoading, setWalletActionLoading] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const role = user?.role === "user" ? "retailer" : user?.role;
  const isMasterRole = role === "master_distributor";
  const isSuperRole = role === "super_distributor";
  const managedChildLabel = isMasterRole ? "Super Distributor" : "Distributor";
  const managerApiPrefix = isSuperRole ? "/super-distributor" : "/master-distributor";
  const managerData = isSuperRole ? superDistributorData : masterDistributorData;
  const displayName = profile?.name || user?.name || "User";
  const displayRole = ROLE_LABELS[role] || "User";
  const profileInitials = useMemo(() => getInitials(displayName), [displayName]);
  const profileImageUrl = useMemo(
    () => toProfileImageUrl(profile?.profile_photo_url || profile?.profile_photo_path || user?.profile_photo_url || user?.profile_photo_path),
    [profile?.profile_photo_url, profile?.profile_photo_path, user?.profile_photo_url, user?.profile_photo_path]
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    const rawUser = localStorage.getItem("user");

    if (!token || !rawUser) {
      navigate("/login");
      return;
    }

    const parsed = JSON.parse(rawUser);
    setUser(parsed);
    if (parsed.role === "user") {
      setActiveSection("recharge");
    }
    loadData(parsed.role === "user" ? "retailer" : parsed.role);
  }, [navigate]);

  useEffect(() => {
    const onWindowClick = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    window.addEventListener("click", onWindowClick);
    return () => window.removeEventListener("click", onWindowClick);
  }, []);

  const loadRetailerData = async () => {
    const [walletRes, transactionRes, profileRes, dashboardRes, withdrawRes, notificationsRes] = await Promise.all([
      api.get("/wallets"),
      api.get("/transactions"),
      api.get("/profile"),
      api.get("/retailer/dashboard"),
      api.get("/retailer/withdraw-requests"),
      api.get("/retailer/notifications"),
    ]);
    setWallets(walletRes.data || []);
    setTransactions(transactionRes.data || []);
    const profileData = profileRes.data || null;
    setProfile(profileData);
    setRetailerDashboard(dashboardRes.data || null);
    setRetailerWithdrawRequests(withdrawRes.data || []);
    setRetailerNotifications(notificationsRes.data || []);
    setProfileForm({
      name: profileData?.name || "",
      phone: profileData?.phone || "",
      date_of_birth: profileData?.date_of_birth ? String(profileData.date_of_birth).slice(0, 10) : "",
    });
    setBankForm({
      bank_account_name: profileData?.bank_account_name || "",
      bank_account_number: profileData?.bank_account_number || "",
      bank_ifsc_code: profileData?.bank_ifsc_code || "",
      bank_name: profileData?.bank_name || "",
    });
  };

  const loadAdminData = async () => {
    const [dashboardRes, usersRes, walletRes, transactionRes, profileRes] = await Promise.all([
      api.get("/admin/dashboard"),
      api.get("/admin/users"),
      api.get("/admin/wallets"),
      api.get("/admin/transactions"),
      api.get("/profile"),
    ]);

    setAdminStats(dashboardRes.data?.stats || null);
    setAdminUsers(usersRes.data || []);
    setWallets(walletRes.data || []);
    setTransactions(transactionRes.data || []);
    setProfile(profileRes.data || null);
  };

  const loadDistributorData = async () => {
    const [dashboardRes, walletRes, transactionRes, profileRes, withdrawRes, performanceRes] = await Promise.all([
      api.get("/distributor/dashboard"),
      api.get("/wallets"),
      api.get("/distributor/transactions"),
      api.get("/profile"),
      api.get("/distributor/withdraw-requests"),
      api.get("/distributor/performance"),
    ]);

    const dashboard = dashboardRes.data || null;
    setDistributorData(dashboard);
    setDistributorPerformance(performanceRes.data || dashboard || null);
    setDistributorWithdrawRequests(withdrawRes.data || []);
    setWallets(walletRes.data || []);

    const walletTransactions = transactionRes.data?.wallet_transactions || [];
    const commissionTransactions = (transactionRes.data?.commission_transactions || []).map((item) => ({
      id: `comm-${item.id}`,
      type: "commission",
      amount: item.commission_amount,
      status: "completed",
      reference: item.reference,
      description: item.description,
      created_at: item.created_at,
    }));
    setTransactions([...walletTransactions, ...commissionTransactions].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    setProfile(profileRes.data || null);

    const initialCommissionDraft = {};
    (dashboard?.retailers || []).forEach((r) => {
      initialCommissionDraft[r.id] = r.commission_override?.distributor_commission ?? "";
    });
    setRetailerCommissionDraft(initialCommissionDraft);
  };

  const loadMasterDistributorData = async () => {
    const [dashboardRes, walletRes, transactionRes, profileRes] = await Promise.all([
      api.get("/master-distributor/dashboard"),
      api.get("/wallets"),
      api.get("/master-distributor/transactions"),
      api.get("/profile"),
    ]);

    const dashboard = dashboardRes.data || null;
    setMasterDistributorData(dashboard);
    setWallets(walletRes.data || []);

    const walletTransactions = transactionRes.data?.wallet_transactions || [];
    const commissionTransactions = (transactionRes.data?.commission_transactions || []).map((item) => ({
      id: `mcomm-${item.id}`,
      type: "commission",
      amount: item.commission_amount,
      status: "completed",
      reference: item.reference,
      description: item.description,
      created_at: item.created_at,
    }));
    setTransactions([...walletTransactions, ...commissionTransactions].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    setProfile(profileRes.data || null);
  };

  const loadSuperDistributorData = async () => {
    const [dashboardRes, walletRes, transactionRes, profileRes] = await Promise.all([
      api.get("/super-distributor/dashboard"),
      api.get("/wallets"),
      api.get("/super-distributor/transactions"),
      api.get("/profile"),
    ]);

    const dashboard = dashboardRes.data || null;
    setSuperDistributorData(dashboard);
    setWallets(walletRes.data || []);

    const walletTransactions = transactionRes.data?.wallet_transactions || [];
    const commissionTransactions = (transactionRes.data?.commission_transactions || []).map((item) => ({
      id: `scomm-${item.id}`,
      type: "commission",
      amount: item.commission_amount,
      status: "completed",
      reference: item.reference,
      description: item.description,
      created_at: item.created_at,
    }));
    setTransactions([...walletTransactions, ...commissionTransactions].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    setProfile(profileRes.data || null);
  };

  const loadData = async (targetRole) => {
    setLoading(true);
    try {
      if (targetRole === "admin") {
        await loadAdminData();
      } else if (targetRole === "master_distributor") {
        await loadMasterDistributorData();
      } else if (targetRole === "super_distributor") {
        await loadSuperDistributorData();
      } else if (targetRole === "distributor") {
        await loadDistributorData();
      } else {
        await loadRetailerData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleProfileMenuAction = (section) => {
    setActiveSection(section);
    setIsProfileMenuOpen(false);
  };

  const reloadManagerData = async () => {
    if (isSuperRole) {
      await loadSuperDistributorData();
      return;
    }
    await loadMasterDistributorData();
  };

  useEffect(() => {
    const defaultName = profile?.name || user?.name || "";
    const defaultEmail = profile?.email || user?.email || "";
    const defaultPhone = String(profile?.phone || user?.phone || "").replace(/\D/g, "").slice(0, 10);

    setInlineDeposit((prev) => ({
      ...prev,
      customer_name: prev.customer_name || defaultName,
      email: prev.email || defaultEmail,
      mobile: prev.mobile || defaultPhone,
      transaction_date: prev.transaction_date || new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
    }));

    setInlineWithdraw((prev) => ({
      ...prev,
      account_holder_name: prev.account_holder_name || defaultName,
      beneficiary_mobile: prev.beneficiary_mobile || defaultPhone,
    }));
  }, [profile, user]);

  const handleInlineDepositSubmit = async (e) => {
    e.preventDefault();
    if (!mainWallet?.id) {
      toast.error("Wallet not found");
      return;
    }
    const amount = Number(inlineDeposit.amount || 0);
    if (!Number.isFinite(amount) || amount < 1) {
      toast.error("Enter valid deposit amount");
      return;
    }

    setWalletActionLoading(true);
    try {
      const response = await api.post("/deposit", {
        wallet_id: Number(mainWallet.id),
        amount,
        payment_method: "manual",
      });
      if (response.data?.success || response.status === 200) {
        toast.success(response.data?.message || "Deposit successful");
        setInlineDeposit((prev) => ({ ...prev, amount: "" }));
        await loadData(role);
      } else {
        toast.error(response.data?.message || "Deposit failed");
      }
    } catch (error) {
      const firstValidationError = error.response?.data?.errors
        ? Object.values(error.response.data.errors)[0]?.[0]
        : null;
      toast.error(firstValidationError || error.response?.data?.message || "Deposit failed");
    } finally {
      setWalletActionLoading(false);
    }
  };

  const handleInlineWithdrawSubmit = async (e) => {
    e.preventDefault();
    if (!mainWallet?.id) {
      toast.error("Wallet not found");
      return;
    }
    const amount = Number(inlineWithdraw.amount || 0);
    if (!Number.isFinite(amount) || amount < 1) {
      toast.error("Enter valid withdraw amount");
      return;
    }

    setWalletActionLoading(true);
    try {
      await api.post("/withdraw", {
        wallet_id: Number(mainWallet.id),
        amount,
        bank_account: inlineWithdraw.account_number,
        ifsc_code: inlineWithdraw.ifsc_code,
        account_holder_name: inlineWithdraw.account_holder_name,
      });
      toast.success("Withdrawal request submitted successfully");
      setInlineWithdraw((prev) => ({ ...prev, amount: "" }));
      await loadData(role);
    } catch (error) {
      const firstValidationError = error.response?.data?.errors
        ? Object.values(error.response.data.errors)[0]?.[0]
        : null;
      toast.error(firstValidationError || error.response?.data?.message || "Withdrawal failed");
    } finally {
      setWalletActionLoading(false);
    }
  };

  const validateCreateBasicStep = (payload) => {
    if (!payload.name || !payload.email || !payload.password || !payload.password_confirmation || !payload.date_of_birth || !payload.phone) {
      toast.error("Please fill all required basic details");
      return false;
    }
    if (payload.password !== payload.password_confirmation) {
      toast.error("Password and confirm password must match");
      return false;
    }
    if (String(payload.phone || "").length !== 10) {
      toast.error("Mobile number must be 10 digits");
      return false;
    }
    return true;
  };

  const handleCreateRetailer = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(newRetailer).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          formData.append(key, value);
        }
      });

      await api.post("/distributor/retailers", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Retailer added successfully");
      setNewRetailer({
        name: "",
        last_name: "",
        email: "",
        password: "",
        password_confirmation: "",
        date_of_birth: "",
        phone: "",
        alternate_mobile: "",
        business_name: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        gst_number: "",
        kyc_document_type: "",
        kyc_id_number: "",
        profile_photo: null,
        kyc_photo: null,
        address_proof_front: null,
        address_proof_back: null,
        bank_account_name: "",
        bank_account_number: "",
        bank_ifsc_code: "",
        bank_name: "",
        admin_commission: "",
        distributor_commission: "",
        mobility_check: "low",
      });
      setRetailerCreateStep(1);
      setRetailerImagePreview({
        profile_photo: "",
        address_proof_front: "",
        address_proof_back: "",
      });
      await loadDistributorData();
    } catch (error) {
      const firstValidationError = error.response?.data?.errors
        ? Object.values(error.response.data.errors)[0]?.[0]
        : null;
      toast.error(firstValidationError || error.response?.data?.message || "Failed to add retailer");
    }
  };

  const handleRetailerCommissionSave = async (retailerId) => {
    const distributor_commission = retailerCommissionDraft[retailerId];
    if (distributor_commission === "" || distributor_commission === null || distributor_commission === undefined) {
      toast.error("Enter commission % first");
      return;
    }
    try {
      await api.put(`/distributor/retailers/${retailerId}`, { distributor_commission });
      toast.success("Retailer commission updated");
      await loadDistributorData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update commission");
    }
  };

  const handleRetailerToggle = async (retailerId) => {
    try {
      const res = await api.post(`/distributor/retailers/${retailerId}/toggle`);
      toast.success(res.data?.message || "Retailer status updated");
      await loadDistributorData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update retailer status");
    }
  };

  const handleRetailerTransactions = async (retailerId) => {
    try {
      const res = await api.get(`/distributor/retailers/${retailerId}/transactions`);
      const walletTx = res.data?.wallet_transactions || [];
      const commTx = (res.data?.commission_transactions || []).map((item) => ({
        id: `rcomm-${item.id}`,
        type: "commission",
        amount: item.commission_amount,
        status: "completed",
        reference: item.reference,
        description: item.description,
        created_at: item.created_at,
      }));
      setSelectedRetailerTransactions({
        retailer: res.data?.retailer,
        transactions: [...walletTx, ...commTx].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch retailer transactions");
    }
  };

  const handleAdminTransfer = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/transfer", {
        from_wallet_id: adminTransferForm.from_wallet_id,
        to_wallet_id: adminTransferForm.to_wallet_id,
        amount: adminTransferForm.amount,
        description: adminTransferForm.description,
      });
      toast.success("Wallet transfer completed successfully");
      setAdminTransferForm({ from_wallet_id: "", to_wallet_id: "", amount: "", description: "" });
      await loadAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Transfer failed");
    }
  };

  const handleWithdrawRequestDecision = async (requestId, action) => {
    try {
      const remarks = withdrawRemarksDraft[requestId] || "";
      await api.post(`/distributor/withdraw-requests/${requestId}/${action}`, { remarks });
      toast.success(`Withdraw request ${action}d successfully`);
      await loadDistributorData();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} withdraw request`);
    }
  };

  const handleCreateDistributor = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(newDistributor).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          formData.append(key, value);
        }
      });

      await api.post(`${managerApiPrefix}/distributors`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(`${managedChildLabel} added successfully`);
      setNewDistributor({
        name: "",
        last_name: "",
        email: "",
        password: "",
        password_confirmation: "",
        date_of_birth: "",
        phone: "",
        alternate_mobile: "",
        business_name: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        gst_number: "",
        kyc_document_type: "",
        kyc_id_number: "",
        profile_photo: null,
        kyc_photo: null,
        address_proof_front: null,
        address_proof_back: null,
        bank_account_name: "",
        bank_account_number: "",
        bank_ifsc_code: "",
        bank_name: "",
        admin_commission: "",
        distributor_commission: "",
        mobility_check: "low",
      });
      setDistributorCreateStep(1);
      setDistributorImagePreview({
        profile_photo: "",
        address_proof_front: "",
        address_proof_back: "",
      });
      await reloadManagerData();
    } catch (error) {
      const firstValidationError = error.response?.data?.errors
        ? Object.values(error.response.data.errors)[0]?.[0]
        : null;
      toast.error(firstValidationError || error.response?.data?.message || `Failed to add ${managedChildLabel.toLowerCase()}`);
    }
  };

  const handleRetailerFileChange = (field, file) => {
    setNewRetailer((prev) => ({ ...prev, [field]: file || null }));

    if (!file || !String(file.type || "").startsWith("image/")) {
      setRetailerImagePreview((prev) => ({ ...prev, [field]: "" }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setRetailerImagePreview((prev) => ({ ...prev, [field]: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  };

  const handleDistributorFileChange = (field, file) => {
    setNewDistributor((prev) => ({ ...prev, [field]: file || null }));

    if (!file || !String(file.type || "").startsWith("image/")) {
      setDistributorImagePreview((prev) => ({ ...prev, [field]: "" }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setDistributorImagePreview((prev) => ({ ...prev, [field]: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  };

  const handleDistributorToggle = async (distributorId) => {
    try {
      const res = await api.post(`${managerApiPrefix}/distributors/${distributorId}/toggle`);
      toast.success(res.data?.message || `${managedChildLabel} status updated`);
      await reloadManagerData();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to update ${managedChildLabel.toLowerCase()} status`);
    }
  };

  const loadTransactionsWithFilters = async (filters = transactionFilters) => {
    try {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      const response = await api.get("/transactions", { params });
      setTransactions(response.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load filtered transactions");
    }
  };

  const handleRetailerExport = async () => {
    try {
      const params = {};
      if (transactionFilters.type) params.type = transactionFilters.type;
      if (transactionFilters.start_date) params.start_date = transactionFilters.start_date;
      if (transactionFilters.end_date) params.end_date = transactionFilters.end_date;

      const response = await api.get("/retailer/statement/export", {
        params,
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `retailer_statement_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to export statement");
    }
  };

  const downloadCsv = (rows, fileName) => {
    const escapeCsv = (value) => {
      const safeValue = String(value ?? "");
      if (safeValue.includes(",") || safeValue.includes("\"") || safeValue.includes("\n")) {
        return `"${safeValue.replace(/"/g, '""')}"`;
      }
      return safeValue;
    };

    const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleRetailerPayoutExport = () => {
    const rows = [
      ["Date", "Transaction ID", "Amount", "Net", "Status", "Remarks"],
      ...filteredRetailerPayouts.map((wr) => [
        new Date(wr.created_at).toLocaleString(),
        wr.reference || wr.transaction_id || wr.id,
        Number(wr.amount || 0).toFixed(2),
        Number(wr.net_amount || 0).toFixed(2),
        wr.status || "",
        wr.remarks || "",
      ]),
    ];

    downloadCsv(rows, `retailer_payout_history_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleRetailerHistoryRefresh = async () => {
    try {
      const currentFilters = { ...transactionFilters };
      await loadRetailerData();
      if (
        retailerTransactionTab === "payin" &&
        (currentFilters.type || currentFilters.start_date || currentFilters.end_date)
      ) {
        await loadTransactionsWithFilters(currentFilters);
      }
      toast.success("History refreshed");
    } catch {
      toast.error("Failed to refresh history");
    }
  };

  const handleRechargeSubmit = (e) => {
    e.preventDefault();
    if (selectedRechargeService === "electricity") {
      if (electricityBillType === "apartments") {
        if (!electricityCity || !electricityApartment || !electricityFlatNo || !electricityMobile) {
          toast.error("Please fill all apartment bill details");
          return;
        }
      } else if (!electricityState || !electricityBoard || !electricityServiceNumber) {
        toast.error("Please fill all electricity board details");
        return;
      }
      toast.success("Electricity payment request captured");
      return;
    }
    if (selectedRechargeService === "dth") {
      if (!dthOperator || !dthSubscriberId) {
        toast.error("Please fill DTH details");
        return;
      }
      toast.success("DTH recharge request captured");
      return;
    }
    if (selectedRechargeService === "metro") {
      if (!metroOperator || !metroCardNumber || !metroAmount) {
        toast.error("Please fill all metro recharge details");
        return;
      }
      toast.success("Metro recharge request captured");
      return;
    }
    if (selectedRechargeService === "broadband") {
      if (!broadbandProvider || !broadbandAccountId || !broadbandAmount) {
        toast.error("Please fill all broadband details");
        return;
      }
      toast.success("Broadband bill payment request captured");
      return;
    }
    if (selectedRechargeService === "education") {
      if (!educationInstitute || !educationStudentId || !educationAmount) {
        toast.error("Please fill all education payment details");
        return;
      }
      toast.success("Education fee payment request captured");
      return;
    }
    if (selectedRechargeService === "insurance") {
      if (!insuranceProvider || !insurancePolicyNumber || !insuranceAmount) {
        toast.error("Please fill all insurance payment details");
        return;
      }
      toast.success("Insurance premium payment request captured");
      return;
    }
    if (selectedRechargeService === "pay-loan") {
      if (!loanProvider || !loanAccountNumber || !loanAmount) {
        toast.error("Please fill all loan payment details");
        return;
      }
      toast.success("Loan payment request captured");
      return;
    }
    if (!rechargeOperator || !rechargeMobile || !rechargeAmount) {
      toast.error("Please fill all recharge details");
      return;
    }
    toast.success(`${rechargeType === "postpaid" ? "Bill payment" : "Recharge"} request captured for ${rechargeOperator}`);
  };

  const handleRequestWithdrawOtp = async () => {
    if (!mainWallet?.id) {
      toast.error("No wallet found");
      return;
    }
    if (!retailerDashboard?.min_withdraw_amount) {
      toast.error("Withdraw config not loaded");
      return;
    }
    try {
      const response = await api.post("/withdraw/request-otp", {
        wallet_id: mainWallet.id,
        amount: retailerDashboard.min_withdraw_amount,
      });
      toast.success(`OTP generated: ${response.data?.otp || "Check backend logs"}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate OTP");
    }
  };

  const handleRetailerProfileSave = async (e) => {
    e.preventDefault();
    try {
      await api.post("/retailer/profile", profileForm);
      toast.success("Profile updated");
      await loadRetailerData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handleRetailerPasswordChange = async (e) => {
    e.preventDefault();
    try {
      await api.post("/retailer/change-password", passwordForm);
      toast.success("Password changed");
      setPasswordForm({ current_password: "", new_password: "", new_password_confirmation: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    }
  };

  const handleRetailerBankSave = async (e) => {
    e.preventDefault();
    try {
      await api.post("/retailer/bank-details", bankForm);
      toast.success("Bank details updated");
      await loadRetailerData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update bank details");
    }
  };

  const handleRetailerKycUpload = async (e) => {
    e.preventDefault();
    if (!kycFile) {
      toast.error("Please choose KYC document");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("kyc_document", kycFile);
      await api.post("/retailer/kyc/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("KYC uploaded");
      setKycFile(null);
      await loadRetailerData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload KYC");
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await api.post(`/retailer/notifications/${id}/read`);
      await loadRetailerData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update notification");
    }
  };

  const totalWalletBalance = useMemo(
    () => wallets.reduce((sum, item) => sum + Number(item.balance || 0), 0),
    [wallets]
  );
  const mainWallet = useMemo(() => wallets.find((item) => item.type === "main") || wallets[0], [wallets]);
  const recentTransactions = useMemo(() => transactions.slice(0, 6), [transactions]);
  const visibleTransactions = useMemo(() => transactions.slice(0, 25), [transactions]);
  const retailerPayinTransactions = useMemo(
    () =>
      visibleTransactions.filter(
        (tx) => String(tx.type || "").toLowerCase() !== "withdraw"
      ),
    [visibleTransactions]
  );
  const filteredRetailerPayins = useMemo(() => {
    const term = retailerPayinSearch.trim().toLowerCase();
    return retailerPayinTransactions.filter((tx) => {
      const status = String(tx.status || "completed").toLowerCase();
      if (retailerPayinStatusFilter !== "all" && status !== retailerPayinStatusFilter) {
        return false;
      }
      if (!term) {
        return true;
      }
      const lookup = [
        tx.id,
        tx.reference,
        tx.type,
        tx.description,
        tx.amount,
        tx.status,
      ]
        .map((item) => String(item || "").toLowerCase())
        .join(" ");
      return lookup.includes(term);
    });
  }, [retailerPayinTransactions, retailerPayinSearch, retailerPayinStatusFilter]);

  const filteredRetailerPayouts = useMemo(() => {
    const term = retailerPayoutSearch.trim().toLowerCase();
    return retailerWithdrawRequests.filter((wr) => {
      const status = String(wr.status || "pending").toLowerCase();
      if (retailerPayoutStatusFilter !== "all" && status !== retailerPayoutStatusFilter) {
        return false;
      }
      if (!term) {
        return true;
      }
      const lookup = [
        wr.id,
        wr.reference,
        wr.transaction_id,
        wr.remarks,
        wr.amount,
        wr.net_amount,
        wr.status,
      ]
        .map((item) => String(item || "").toLowerCase())
        .join(" ");
      return lookup.includes(term);
    });
  }, [retailerWithdrawRequests, retailerPayoutSearch, retailerPayoutStatusFilter]);

  const payoutStats = useMemo(() => {
    const statusList = filteredRetailerPayouts.map((item) => String(item.status || "pending").toLowerCase());
    return {
      totalVolume: filteredRetailerPayouts.reduce((sum, item) => sum + Number(item.amount || 0), 0),
      processedCount: statusList.filter((status) => ["approved", "completed", "success", "processed"].includes(status)).length,
      pendingCount: statusList.filter((status) => ["pending", "processing", "initiated"].includes(status)).length,
      failedCount: statusList.filter((status) => ["failed", "rejected", "cancelled", "declined", "error"].includes(status)).length,
      netVolume: filteredRetailerPayouts.reduce((sum, item) => sum + Number(item.net_amount || 0), 0),
    };
  }, [filteredRetailerPayouts]);

  const payinStats = useMemo(() => {
    const statusList = filteredRetailerPayins.map((item) => String(item.status || "completed").toLowerCase());
    return {
      totalVolume: filteredRetailerPayins.reduce((sum, item) => sum + Number(item.amount || 0), 0),
      successCount: statusList.filter((status) => ["approved", "completed", "success", "processed"].includes(status)).length,
      pendingCount: statusList.filter((status) => ["pending", "processing", "initiated"].includes(status)).length,
      failedCount: statusList.filter((status) => ["failed", "rejected", "cancelled", "declined", "error"].includes(status)).length,
    };
  }, [filteredRetailerPayins]);
  const rechargeOperatorSource = useMemo(
    () => {
      if (selectedRechargeService === "dth") {
        return DTH_OPERATORS;
      }
      if (selectedRechargeService === "metro") {
        return METRO_OPERATORS;
      }
      if (selectedRechargeService === "broadband") {
        return BROADBAND_PROVIDERS;
      }
      if (selectedRechargeService === "education") {
        return EDUCATION_INSTITUTES;
      }
      if (selectedRechargeService === "insurance") {
        return INSURANCE_PROVIDERS;
      }
      if (selectedRechargeService === "pay-loan") {
        return LOAN_PROVIDERS;
      }
      return RECHARGE_OPERATORS;
    },
    [selectedRechargeService]
  );
  const filteredRechargeOperators = useMemo(() => {
    const term = rechargeOperatorSearch.trim().toLowerCase();
    if (!term) {
      return rechargeOperatorSource;
    }
    return rechargeOperatorSource.filter((operator) => {
      const lookup = `${operator.key} ${operator.title} ${operator.mark}`.toLowerCase();
      return lookup.includes(term);
    });
  }, [rechargeOperatorSource, rechargeOperatorSearch]);
  const selectedMobilePlanSuggestions = useMemo(
    () => RECHARGE_PLAN_SUGGESTIONS[rechargeOperator] || RECHARGE_QUICK_AMOUNTS.slice(0, 3).map((amount) => ({
      amount,
      validity: "Popular",
      benefits: "Tap to auto-fill amount",
    })),
    [rechargeOperator]
  );
  const showDistributorUsersSection =
    role === "distributor" && (activeSection === "retailers" || (activeSection === "user-management" && userManagementTab === "users"));
  const showMasterUsersSection =
    (role === "master_distributor" || role === "super_distributor") &&
    (activeSection === "distributors" || (activeSection === "user-management" && userManagementTab === "users"));

  if (loading) {
    return (
      <div className="role-screen-center">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="role-page">
      <aside className="role-sidebar">
        <div className="role-brand">
          <div className="role-brand-logo" aria-hidden="true">XT</div>
          <div className="role-brand-meta">
            <strong>{COMPANY_NAME}</strong>
            <span>{COMPANY_TAGLINE}</span>
            <small>{displayRole} Panel</small>
          </div>
        </div>
        <button className={`role-nav-btn ${activeSection === "dashboard" ? "active" : ""}`} onClick={() => setActiveSection("dashboard")}><i className="bi bi-house-door-fill" />Dashboard</button>
        {role === "admin" && (
          <button className={`role-nav-btn ${activeSection === "wallet-transfer" ? "active" : ""}`} onClick={() => setActiveSection("wallet-transfer")}><i className="bi bi-arrow-left-right" />Wallet Transfer</button>
        )}
        {role === "distributor" && (
          <>
            <button
              className={`role-nav-btn ${activeSection === "user-management" ? "active" : ""}`}
              onClick={() => {
                setActiveSection("user-management");
                setUserManagementTab("users");
              }}
            >
              <i className="bi bi-people-fill" />User Management
            </button>
            {activeSection === "user-management" && (
              <div className="role-subnav">
                <button className={`role-subnav-btn ${userManagementTab === "roles" ? "active" : ""}`} onClick={() => setUserManagementTab("roles")}><i className="bi bi-diagram-3-fill" />Roles</button>
                <button className={`role-subnav-btn ${userManagementTab === "users" ? "active" : ""}`} onClick={() => setUserManagementTab("users")}><i className="bi bi-person-lines-fill" />Users</button>
              </div>
            )}
            <button className={`role-nav-btn ${activeSection === "wallet" ? "active" : ""}`} onClick={() => setActiveSection("wallet")}><i className="bi bi-wallet2" />Wallet</button>
            <button className={`role-nav-btn ${activeSection === "performance" ? "active" : ""}`} onClick={() => setActiveSection("performance")}><i className="bi bi-graph-up-arrow" />Performance</button>
            <button className={`role-nav-btn ${activeSection === "withdrawals" ? "active" : ""}`} onClick={() => setActiveSection("withdrawals")}><i className="bi bi-cash-stack" />Withdraw Requests</button>
          </>
        )}
        {(role === "master_distributor" || role === "super_distributor") && (
          <>
            <button
              className={`role-nav-btn ${activeSection === "user-management" ? "active" : ""}`}
              onClick={() => {
                setActiveSection("user-management");
                setUserManagementTab("users");
              }}
            >
              <i className="bi bi-people-fill" />User Management
            </button>
            {activeSection === "user-management" && (
              <div className="role-subnav">
                <button className={`role-subnav-btn ${userManagementTab === "roles" ? "active" : ""}`} onClick={() => setUserManagementTab("roles")}><i className="bi bi-diagram-3-fill" />Roles</button>
                <button className={`role-subnav-btn ${userManagementTab === "users" ? "active" : ""}`} onClick={() => setUserManagementTab("users")}><i className="bi bi-person-lines-fill" />Users</button>
              </div>
            )}
            <button className={`role-nav-btn ${activeSection === "wallet" ? "active" : ""}`} onClick={() => setActiveSection("wallet")}><i className="bi bi-wallet2" />Wallet</button>
          </>
        )}
        {role === "retailer" && (
          <>
            <button className={`role-nav-btn ${activeSection === "wallet" ? "active" : ""}`} onClick={() => setActiveSection("wallet")}><i className="bi bi-wallet2" />Wallet</button>
            <button
              className={`role-nav-btn ${activeSection === "transactions" ? "active" : ""}`}
              onClick={() => {
                setActiveSection("transactions");
                setRetailerTransactionTab("payouts");
              }}
            >
              <i className="bi bi-receipt-cutoff" />Transactions
            </button>
            {activeSection === "transactions" && (
              <div className="role-subnav">
                <button
                  className={`role-subnav-btn ${retailerTransactionTab === "payin" ? "active" : ""}`}
                  onClick={() => {
                    setActiveSection("transactions");
                    setRetailerTransactionTab("payin");
                  }}
                >
                  <i className="bi bi-box-arrow-in-down" />Payin History
                </button>
                <button
                  className={`role-subnav-btn ${retailerTransactionTab === "payouts" ? "active" : ""}`}
                  onClick={() => {
                    setActiveSection("transactions");
                    setRetailerTransactionTab("payouts");
                  }}
                >
                  <i className="bi bi-box-arrow-up-right" />Payouts History
                </button>
              </div>
            )}
            <button className={`role-nav-btn ${activeSection === "recharge" ? "active" : ""}`} onClick={() => setActiveSection("recharge")}><i className="bi bi-phone-fill" />Recharge</button>
            <button className={`role-nav-btn ${activeSection === "notifications" ? "active" : ""}`} onClick={() => setActiveSection("notifications")}><i className="bi bi-bell-fill" />Notifications</button>
          </>
        )}
        {role !== "retailer" && (
          <button className={`role-nav-btn ${activeSection === "transactions" ? "active" : ""}`} onClick={() => setActiveSection("transactions")}><i className="bi bi-receipt-cutoff" />Transactions</button>
        )}
      </aside>

      <main className="role-main">
        <header className="role-header">
          <h2>{role === "admin" ? "Admin Dashboard" : role === "master_distributor" ? "Master Distributor Dashboard" : role === "super_distributor" ? "Super Distributor Dashboard" : role === "distributor" ? "Distributor Dashboard" : "Retailer Dashboard"}</h2>
          <div className={`role-profile-wrap ${isProfileMenuOpen ? "open" : ""}`} ref={profileMenuRef}>
            <button
              className="role-profile-chip"
              type="button"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={isProfileMenuOpen}
            >
              <div className="role-profile-meta">
                <strong>{displayName}</strong>
                <span>{displayRole}</span>
              </div>
              <div className="role-profile-avatar">
                {profileImageUrl ? <img src={profileImageUrl} alt={`${displayName} profile`} /> : <span>{profileInitials}</span>}
              </div>
              <i className="bi bi-chevron-down role-profile-caret" />
            </button>
            <div className="role-profile-menu" role="menu">
              <button type="button" onClick={() => handleProfileMenuAction("profile")}><i className="bi bi-person-circle" />Profile</button>
              <button type="button" onClick={handleLogout}><i className="bi bi-box-arrow-right" />Logout</button>
            </div>
          </div>
        </header>

        {activeSection === "dashboard" && (
          <>
            <section className="role-stat-grid">
              {role === "admin" && (
                <>
                  <div className="role-stat-card blue"><span>Total Wallet Balance</span><strong>{formatCurrency(adminStats?.total_balance)}</strong></div>
                  <div className="role-stat-card gold"><span>Total Distributors</span><strong>{adminStats?.total_distributors || 0}</strong></div>
                  <div className="role-stat-card teal"><span>Total Retailers</span><strong>{adminStats?.total_retailers || 0}</strong></div>
                  <div className="role-stat-card pink"><span>Total Commission</span><strong>{formatCurrency(adminStats?.total_commission)}</strong></div>
                </>
              )}
              {role === "distributor" && (
                <>
                  <div className="role-stat-card blue"><span>Wallet Balance</span><strong>{formatCurrency(distributorData?.wallet_balance)}</strong></div>
                  <div className="role-stat-card indigo"><span>Commission Earned</span><strong>{formatCurrency(distributorData?.commission_earned)}</strong></div>
                  <div className="role-stat-card green"><span>Total Retailers</span><strong>{distributorData?.total_retailers || 0}</strong></div>
                  <div className="role-stat-card pink"><span>Total Bonus</span><strong>{formatCurrency(distributorPerformance?.bonus?.total_bonus)}</strong></div>
                </>
              )}
              {(role === "master_distributor" || role === "super_distributor") && (
                <>
                  <div className="role-stat-card blue"><span>Wallet Balance</span><strong>{formatCurrency(managerData?.wallet_balance)}</strong></div>
                  <div className="role-stat-card indigo"><span>Commission Earned</span><strong>{formatCurrency(managerData?.commission_earned)}</strong></div>
                  <div className="role-stat-card green"><span>{isMasterRole ? "Total Super Distributors" : "Total Distributors"}</span><strong>{managerData?.total_distributors || 0}</strong></div>
                  <div className="role-stat-card gold"><span>Total Retailers</span><strong>{managerData?.distributors?.reduce((sum, d) => sum + (d.total_retailers || 0), 0) || 0}</strong></div>
                </>
              )}
              {role === "retailer" && (
                <>
                  <div className="role-stat-card blue"><span>Wallet Balance</span><strong>{formatCurrency(retailerDashboard?.wallet_balance || mainWallet?.balance)}</strong></div>
                  <div className="role-stat-card indigo"><span>Min Withdraw</span><strong>{formatCurrency(retailerDashboard?.min_withdraw_amount)}</strong></div>
                  <div className="role-stat-card pink"><span>Pending Requests</span><strong>{retailerDashboard?.withdraw_requests_pending || 0}</strong></div>
                </>
              )}
            </section>

            <section className="role-content-grid">
              {role === "admin" && (
                <article className="role-panel">
                  <h4>Distributor List</h4>
                  <table className="role-table">
                    <thead><tr><th>Name</th><th>Email</th><th>Retailers</th><th>Status</th></tr></thead>
                    <tbody>
                      {adminUsers.filter((u) => u.role === "distributor").map((u) => (
                        <tr key={u.id}>
                          <td>{u.name}</td>
                          <td>{u.email}</td>
                          <td>{adminUsers.filter((r) => r.role === "retailer" && Number(r.distributor_id) === Number(u.id)).length}</td>
                          <td>{u.is_active ? "Active" : "Inactive"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </article>
              )}

              {(role === "master_distributor" || role === "super_distributor") && (
                <>
                  <article className="role-panel">
                    <h4>Recent {isMasterRole ? "Super Distributors" : "Distributors"}</h4>
                    <table className="role-table">
                      <thead><tr><th>Name</th><th>Email</th><th>Balance</th><th>Retailers</th><th>Status</th></tr></thead>
                      <tbody>
                        {(managerData?.distributors || []).slice(0, 6).map((distributor) => (
                          <tr key={distributor.id}>
                            <td>{distributor.name}</td>
                            <td>{distributor.email}</td>
                            <td>{formatCurrency(distributor.balance)}</td>
                            <td>{distributor.total_retailers || 0}</td>
                            <td>{distributor.is_active ? "Active" : "Inactive"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </article>
                </>
              )}

              {role === "distributor" && (
                <>
                  <article className="role-panel">
                    <h4>Retailer Withdraw Summary</h4>
                    <table className="role-table">
                      <tbody>
                        <tr><th>Weekly Withdraw</th><td>{formatCurrency(distributorPerformance?.retailer_withdraw_summary?.weekly)}</td></tr>
                        <tr><th>Monthly Withdraw</th><td>{formatCurrency(distributorPerformance?.retailer_withdraw_summary?.monthly)}</td></tr>
                        <tr><th>Bonus Commission</th><td>{formatCurrency(distributorPerformance?.bonus?.bonus_commission)}</td></tr>
                        <tr><th>Performance Incentive</th><td>{formatCurrency(distributorPerformance?.bonus?.performance_incentive)}</td></tr>
                        <tr><th>Target Rewards</th><td>{formatCurrency(distributorPerformance?.bonus?.target_rewards)}</td></tr>
                      </tbody>
                    </table>
                  </article>
                  <article className="role-panel">
                    <h4>Recent Retailers</h4>
                    <table className="role-table">
                      <thead><tr><th>Name</th><th>Email</th><th>Balance</th><th>Status</th></tr></thead>
                      <tbody>
                        {(distributorData?.retailers || []).slice(0, 6).map((retailer) => (
                          <tr key={retailer.id}>
                            <td>{retailer.name}</td>
                            <td>{retailer.email}</td>
                            <td>{formatCurrency(retailer.balance)}</td>
                            <td>{retailer.is_active ? "Active" : "Inactive"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </article>
                </>
              )}

              {role === "retailer" && (
                <article className="role-panel">
                  <h4>Withdraw Funds</h4>
                  <div className="role-actions">
                    <button className="secondary" onClick={() => setShowDepositModal(true)}>Deposit</button>
                    <button onClick={() => setShowWithdrawModal(true)}>Withdraw</button>
                  </div>
                  <p className="muted">Withdrawal request is submitted for approval.</p>
                </article>
              )}
            </section>

            <section className="role-panel">
              <h4>Transaction History</h4>
              <table className="role-table">
                <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Status</th><th>Details</th></tr></thead>
                <tbody>
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>{new Date(tx.created_at).toLocaleDateString()}</td>
                      <td className="text-capitalize">{tx.type}</td>
                      <td>{formatCurrency(tx.amount)}</td>
                      <td className="text-capitalize">{tx.status || "completed"}</td>
                      <td>{tx.description || tx.reference || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

          </>
        )}

        {role === "admin" && activeSection === "wallet-transfer" && (
          <section className="role-panel">
            <h4>Transfer Wallet To Wallet</h4>
            <form className="role-form" onSubmit={handleAdminTransfer}>
              <select
                value={adminTransferForm.from_wallet_id}
                onChange={(e) => setAdminTransferForm((p) => ({ ...p, from_wallet_id: e.target.value }))}
                required
              >
                <option value="">Select Source Wallet</option>
                {wallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.name} - {wallet.user?.name || "Unknown User"} ({formatCurrency(wallet.balance)})
                  </option>
                ))}
              </select>

              <select
                value={adminTransferForm.to_wallet_id}
                onChange={(e) => setAdminTransferForm((p) => ({ ...p, to_wallet_id: e.target.value }))}
                required
              >
                <option value="">Select Destination Wallet</option>
                {wallets
                  .filter((wallet) => String(wallet.id) !== String(adminTransferForm.from_wallet_id))
                  .map((wallet) => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name} - {wallet.user?.name || "Unknown User"} ({formatCurrency(wallet.balance)})
                    </option>
                  ))}
              </select>

              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Amount"
                value={adminTransferForm.amount}
                onChange={(e) => setAdminTransferForm((p) => ({ ...p, amount: e.target.value }))}
                required
              />
              <input
                placeholder="Description (optional)"
                value={adminTransferForm.description}
                onChange={(e) => setAdminTransferForm((p) => ({ ...p, description: e.target.value }))}
              />
              <button type="submit">Transfer</button>
            </form>
          </section>
        )}

        {showDistributorUsersSection && (
          <>
            <section className="role-panel">
                <h4>Create Retailer</h4>
                <form className="role-form role-wizard" onSubmit={handleCreateRetailer}>
                  <div className="role-wizard-steps">
                    <button type="button" className={`role-wizard-step ${retailerCreateStep === 1 ? "active" : ""}`} onClick={() => setRetailerCreateStep(1)}>Personal Information</button>
                    <span className="role-wizard-divider" />
                    <button type="button" className={`role-wizard-step ${retailerCreateStep === 2 ? "active" : ""}`} onClick={() => setRetailerCreateStep(2)}>User eKYC</button>
                    <span className="role-wizard-divider" />
                    <button type="button" className={`role-wizard-step ${retailerCreateStep === 3 ? "active" : ""}`} onClick={() => setRetailerCreateStep(3)}>Bank Information</button>
                    <span className="role-wizard-divider" />
                    <button type="button" className={`role-wizard-step ${retailerCreateStep === 4 ? "active" : ""}`} onClick={() => setRetailerCreateStep(4)}>Commission Settings</button>
                  </div>

                  <div className="role-wizard-body">
                    {retailerCreateStep === 1 && (
                      <div className="role-wizard-section">
                        <h5>Personal Information</h5>
                        <div className="role-wizard-grid">
                          <label className="role-field-label">First Name *<input placeholder="First Name" value={newRetailer.name} onChange={(e) => setNewRetailer((p) => ({ ...p, name: e.target.value }))} required /></label>
                          <label className="role-field-label">Last Name *<input placeholder="Last Name" value={newRetailer.last_name} onChange={(e) => setNewRetailer((p) => ({ ...p, last_name: e.target.value }))} /></label>
                          <label className="role-field-label">Date of Birth<input type="date" value={newRetailer.date_of_birth} onChange={(e) => setNewRetailer((p) => ({ ...p, date_of_birth: e.target.value }))} required /></label>
                          <label className="role-field-label">Email Address *<input placeholder="Email Address" type="email" value={newRetailer.email} onChange={(e) => setNewRetailer((p) => ({ ...p, email: e.target.value }))} required /></label>
                          <label className="role-field-label">Mobile Number *<input placeholder="Mobile Number" value={newRetailer.phone} maxLength={10} onChange={(e) => setNewRetailer((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))} required /></label>
                          <label className="role-field-label">Alternative Mobile Number<input placeholder="Alternative Mobile Number" value={newRetailer.alternate_mobile} maxLength={10} onChange={(e) => setNewRetailer((p) => ({ ...p, alternate_mobile: e.target.value.replace(/\D/g, "").slice(0, 10) }))} /></label>
                          <label className="role-field-label">Business Name *<input placeholder="Business Name" value={newRetailer.business_name} onChange={(e) => setNewRetailer((p) => ({ ...p, business_name: e.target.value }))} /></label>
                          <label className="role-field-label">Company Name<input placeholder="Company Name (optional)" /></label>
                          <label className="role-field-label">Address *<input placeholder="Address" value={newRetailer.address} onChange={(e) => setNewRetailer((p) => ({ ...p, address: e.target.value }))} /></label>
                          <label className="role-field-label">GST Number<input placeholder="GST Number" value={newRetailer.gst_number} onChange={(e) => setNewRetailer((p) => ({ ...p, gst_number: e.target.value.toUpperCase() }))} /></label>
                          <label className="role-field-label">State *<select value={newRetailer.state} onChange={(e) => setNewRetailer((p) => ({ ...p, state: e.target.value }))}><option value="">Select State</option>{INDIA_STATES.map((stateName) => (<option key={stateName} value={stateName}>{stateName}</option>))}</select></label>
                          <label className="role-field-label">City *<input placeholder="City" value={newRetailer.city} onChange={(e) => setNewRetailer((p) => ({ ...p, city: e.target.value }))} /></label>
                          <label className="role-field-label">Pincode *<input placeholder="Pincode" value={newRetailer.pincode} maxLength={6} onChange={(e) => setNewRetailer((p) => ({ ...p, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))} /></label>
                          <label className="role-field-label">Upload Photo<div className="role-upload-wrap"><input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => handleRetailerFileChange("profile_photo", e.target.files?.[0] || null)} /><div className="role-upload-help">Upload Photo, max size 2MB</div></div></label>
                          <label className="role-field-label">Password *<input placeholder="Password" type="password" value={newRetailer.password} onChange={(e) => setNewRetailer((p) => ({ ...p, password: e.target.value }))} required /></label>
                          <label className="role-field-label">Confirm Password *<input placeholder="Confirm Password" type="password" value={newRetailer.password_confirmation} onChange={(e) => setNewRetailer((p) => ({ ...p, password_confirmation: e.target.value }))} required /></label>
                        </div>
                        <div className="role-wizard-actions"><span /><button type="button" onClick={() => { if (validateCreateBasicStep(newRetailer)) setRetailerCreateStep(2); }}>Next</button></div>
                      </div>
                    )}

                    {retailerCreateStep === 2 && (
                      <div className="role-wizard-section">
                        <h5>User eKYC</h5>
                        <div className="role-wizard-grid">
                          <label className="role-field-label">Document Type *<select value={newRetailer.kyc_document_type} onChange={(e) => setNewRetailer((p) => ({ ...p, kyc_document_type: e.target.value }))}><option value="">Select Document Type</option>{KYC_DOCUMENT_TYPES.map((docType) => (<option key={docType} value={docType}>{docType}</option>))}</select></label>
                          <label className="role-field-label">Document Number *<input placeholder="Aadhaar Number" value={newRetailer.kyc_id_number} maxLength={12} onChange={(e) => setNewRetailer((p) => ({ ...p, kyc_id_number: e.target.value.replace(/\D/g, "").slice(0, 12) }))} /></label>
                          <label className="role-field-label">Upload Document Front *<div className="role-upload-wrap"><input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(e) => handleRetailerFileChange("address_proof_front", e.target.files?.[0] || null)} /><div className="role-upload-help">Required by backend validation</div></div></label>
                          <label className="role-field-label">Upload Document Back *<div className="role-upload-wrap"><input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(e) => handleRetailerFileChange("address_proof_back", e.target.files?.[0] || null)} /><div className="role-upload-help">Required by backend validation</div></div></label>
                          <label className="role-field-label">Upload KYC Document<div className="role-upload-wrap"><input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(e) => handleRetailerFileChange("kyc_photo", e.target.files?.[0] || null)} /></div></label>
                        </div>
                        <div className="role-upload-preview">
                          <strong>Image Preview</strong>
                          <div className="role-upload-preview-grid">
                            {retailerImagePreview.profile_photo && <img src={retailerImagePreview.profile_photo} alt="Profile preview" />}
                            {retailerImagePreview.address_proof_front && <img src={retailerImagePreview.address_proof_front} alt="Document front preview" />}
                            {retailerImagePreview.address_proof_back && <img src={retailerImagePreview.address_proof_back} alt="Document back preview" />}
                          </div>
                        </div>
                        <div className="role-wizard-actions"><button type="button" className="secondary" onClick={() => setRetailerCreateStep(1)}>Previous</button><button type="button" onClick={() => setRetailerCreateStep(3)}>Next</button></div>
                      </div>
                    )}

                    {retailerCreateStep === 3 && (
                      <div className="role-wizard-section">
                        <h5>Bank Information</h5>
                        <div className="role-wizard-grid">
                          <label className="role-field-label">Account Holder Name *<input placeholder="Account holder name" value={newRetailer.bank_account_name} onChange={(e) => setNewRetailer((p) => ({ ...p, bank_account_name: e.target.value }))} /></label>
                          <label className="role-field-label">Bank Name *<input placeholder="Bank Name" value={newRetailer.bank_name} onChange={(e) => setNewRetailer((p) => ({ ...p, bank_name: e.target.value }))} /></label>
                          <label className="role-field-label">Account Number *<input placeholder="Account Number" value={newRetailer.bank_account_number} onChange={(e) => setNewRetailer((p) => ({ ...p, bank_account_number: e.target.value }))} /></label>
                          <label className="role-field-label">IFSC Code *<input placeholder="IFSC Code" value={newRetailer.bank_ifsc_code} onChange={(e) => setNewRetailer((p) => ({ ...p, bank_ifsc_code: e.target.value }))} /></label>
                        </div>
                        <div className="role-wizard-actions"><button type="button" className="secondary" onClick={() => setRetailerCreateStep(2)}>Previous</button><button type="button" onClick={() => setRetailerCreateStep(4)}>Next</button></div>
                      </div>
                    )}

                    {retailerCreateStep === 4 && (
                      <div className="role-wizard-section">
                        <h5>Commission Settings</h5>
                        <div className="role-wizard-grid">
                          <label className="role-field-label">Role<input value="Retailer" readOnly /></label>
                          <label className="role-field-label">Mobility Check<select value={newRetailer.mobility_check} onChange={(e) => setNewRetailer((p) => ({ ...p, mobility_check: e.target.value }))}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
                          <label className="role-field-label">Admin Commission (%)<input type="number" min="0" max="100" step="0.01" value={newRetailer.admin_commission} onChange={(e) => setNewRetailer((p) => ({ ...p, admin_commission: e.target.value }))} placeholder="Commission rate" /></label>
                          <label className="role-field-label">Distributor Commission (%)<input type="number" min="0" max="100" step="0.01" value={newRetailer.distributor_commission} onChange={(e) => setNewRetailer((p) => ({ ...p, distributor_commission: e.target.value }))} placeholder="Distributor commission" /></label>
                        </div>
                        <p className="role-wizard-note"><strong>Note:</strong> Commission settings are optional and kept for same flow UI.</p>
                        <div className="role-wizard-actions"><button type="button" className="secondary" onClick={() => setRetailerCreateStep(3)}>Previous</button><button type="submit">Create Retailer</button></div>
                      </div>
                    )}
                  </div>
                </form>
            </section>

            <section className="role-panel">
              <h4>Retailer Management</h4>
              <table className="role-table">
                <thead><tr><th>Name</th><th>Email</th><th>Balance</th><th>Commission %</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {(distributorData?.retailers || []).map((retailer) => (
                    <tr key={retailer.id}>
                      <td>{retailer.name}</td>
                      <td>{retailer.email}</td>
                      <td>{formatCurrency(retailer.balance)}</td>
                      <td>
                        <div className="role-inline-input">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={retailerCommissionDraft[retailer.id] ?? ""}
                            onChange={(e) => setRetailerCommissionDraft((p) => ({ ...p, [retailer.id]: e.target.value }))}
                            placeholder="Distributor %"
                          />
                          <button type="button" onClick={() => handleRetailerCommissionSave(retailer.id)}>Save</button>
                        </div>
                      </td>
                      <td>{retailer.is_active ? "Active" : "Inactive"}</td>
                      <td>
                        <div className="role-actions">
                          <button type="button" onClick={() => handleRetailerToggle(retailer.id)}>
                            {retailer.is_active ? "Deactivate" : "Activate"}
                          </button>
                          <button type="button" className="secondary" onClick={() => handleRetailerTransactions(retailer.id)}>
                            View Tx
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {selectedRetailerTransactions && (
              <section className="role-panel">
                <h4>Retailer Transactions: {selectedRetailerTransactions.retailer?.name}</h4>
                <table className="role-table">
                  <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Status</th><th>Details</th></tr></thead>
                  <tbody>
                    {selectedRetailerTransactions.transactions.slice(0, 50).map((tx) => (
                      <tr key={tx.id}>
                        <td>{new Date(tx.created_at).toLocaleString()}</td>
                        <td className="text-capitalize">{tx.type}</td>
                        <td>{formatCurrency(tx.amount)}</td>
                        <td className="text-capitalize">{tx.status || "completed"}</td>
                        <td>{tx.description || tx.reference || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}
          </>
        )}

        {role === "distributor" && activeSection === "user-management" && (
          <>
            {userManagementTab === "roles" && (
              <>
                <section className="role-stat-grid">
                  <div className="role-stat-card green"><span>Total Retailers</span><strong>{distributorData?.total_retailers || 0}</strong></div>
                  <div className="role-stat-card blue"><span>Active Retailers</span><strong>{(distributorData?.retailers || []).filter((item) => item.is_active).length}</strong></div>
                  <div className="role-stat-card pink"><span>Inactive Retailers</span><strong>{(distributorData?.retailers || []).filter((item) => !item.is_active).length}</strong></div>
                  <div className="role-stat-card indigo"><span>Pending Withdraw</span><strong>{(distributorWithdrawRequests || []).filter((item) => item.status === "pending").length}</strong></div>
                </section>
                <section className="role-panel">
                  <h4>Roles</h4>
                  <table className="role-table">
                    <thead><tr><th>Role</th><th>Total</th><th>Active</th><th>Inactive</th></tr></thead>
                    <tbody>
                      <tr>
                        <td>Distributor</td>
                        <td>1</td>
                        <td>{user?.is_active === false ? 0 : 1}</td>
                        <td>{user?.is_active === false ? 1 : 0}</td>
                      </tr>
                      <tr>
                        <td>Retailer</td>
                        <td>{distributorData?.total_retailers || 0}</td>
                        <td>{(distributorData?.retailers || []).filter((item) => item.is_active).length}</td>
                        <td>{(distributorData?.retailers || []).filter((item) => !item.is_active).length}</td>
                      </tr>
                    </tbody>
                  </table>
                </section>
              </>
            )}
          </>
        )}

        {role === "distributor" && activeSection === "wallet" && (
          <>
            <section className="role-stat-grid">
              <div className="role-stat-card blue"><span>Total Wallet Balance</span><strong>{formatCurrency(distributorData?.wallet_balance)}</strong></div>
              <div className="role-stat-card indigo"><span>Total Commission Earned</span><strong>{formatCurrency(distributorData?.commission_earned)}</strong></div>
            </section>
            <section className="role-panel role-wallet-panel">
              <div className="role-wallet-header">
                <div>
                  <h4>Wallet</h4>
                  <p className="muted">Add funds or withdraw to your wallet</p>
                </div>
                <div className="role-wallet-balance-card">
                  <span>Balance</span>
                  <strong>{formatCurrency(mainWallet?.balance || 0)}</strong>
                </div>
              </div>

              <div className="role-wallet-tabs">
                <button type="button" className={walletActionTab === "deposit" ? "active" : ""} onClick={() => setWalletActionTab("deposit")}>Add Funds</button>
                <button type="button" className={walletActionTab === "withdraw" ? "active" : ""} onClick={() => setWalletActionTab("withdraw")}>Withdraw Funds</button>
              </div>

              {walletActionTab === "deposit" ? (
                <form className="role-wallet-form" onSubmit={handleInlineDepositSubmit}>
                  <p className="muted">Fill the form below to add funds to your wallet</p>
                  <div className="role-wallet-grid">
                    <label>Customer Name *<input value={inlineDeposit.customer_name} onChange={(e) => setInlineDeposit((p) => ({ ...p, customer_name: e.target.value }))} placeholder="Enter customer name" required /></label>
                    <label>Mobile Number *<input value={inlineDeposit.mobile} maxLength={10} onChange={(e) => setInlineDeposit((p) => ({ ...p, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) }))} placeholder="Enter mobile number" required /><small>10 digits</small></label>
                    <label>Email Address *<input type="email" value={inlineDeposit.email} onChange={(e) => setInlineDeposit((p) => ({ ...p, email: e.target.value }))} placeholder="Enter email address" required /></label>
                    <label>Amount to Pay *<div className="role-wallet-input-icon"><span>₹</span><input type="number" min="1" step="0.01" value={inlineDeposit.amount} onChange={(e) => setInlineDeposit((p) => ({ ...p, amount: e.target.value }))} placeholder="Enter amount" required /></div><small>Enter amount in INR</small></label>
                    <label>Payment Category *<select value={inlineDeposit.category} onChange={(e) => setInlineDeposit((p) => ({ ...p, category: e.target.value }))}><option value="education">Education</option></select><small>Only Education available</small></label>
                    <label>Transaction Date<input value={inlineDeposit.transaction_date} readOnly /></label>
                  </div>
                  <div className="role-wallet-actions">
                    <button type="button" className="secondary" onClick={() => setInlineDeposit((p) => ({ ...p, amount: "" }))}>Reset</button>
                    <button type="submit" disabled={walletActionLoading}>{walletActionLoading ? "Processing..." : "PAY NOW"}</button>
                  </div>
                </form>
              ) : (
                <form className="role-wallet-form" onSubmit={handleInlineWithdrawSubmit}>
                  <div className="role-wallet-info">Wallet E Fund Transfer<br />Funds will be transferred via Wallet E Connected Banking API<br /><strong>Available Balance: {formatCurrency(mainWallet?.balance || 0)}</strong></div>
                  <div className="role-wallet-grid">
                    <label>Payment Mode *<select value={inlineWithdraw.payment_mode} onChange={(e) => setInlineWithdraw((p) => ({ ...p, payment_mode: e.target.value }))}><option value="IMPS">IMPS</option><option value="NEFT">NEFT</option><option value="RTGS">RTGS</option></select></label>
                    <label>Amount *<div className="role-wallet-input-icon"><span>₹</span><input type="number" min="1" step="0.01" value={inlineWithdraw.amount} onChange={(e) => setInlineWithdraw((p) => ({ ...p, amount: e.target.value }))} placeholder="Enter amount" required /></div><small>Minimum ₹1</small></label>
                    <label>Account Number *<input value={inlineWithdraw.account_number} onChange={(e) => setInlineWithdraw((p) => ({ ...p, account_number: e.target.value.replace(/\D/g, "") }))} placeholder="Enter account number" required /><small>Minimum 9 digits</small></label>
                    <label>IFSC Code *<input value={inlineWithdraw.ifsc_code} onChange={(e) => setInlineWithdraw((p) => ({ ...p, ifsc_code: e.target.value.toUpperCase() }))} placeholder="Enter IFSC code" required /><small>11 characters (Format: ABCD0123456)</small></label>
                    <label>Account Holder Name *<input value={inlineWithdraw.account_holder_name} onChange={(e) => setInlineWithdraw((p) => ({ ...p, account_holder_name: e.target.value }))} placeholder="Enter account holder name" required /></label>
                    <label>Beneficiary Mobile No *<input value={inlineWithdraw.beneficiary_mobile} maxLength={10} onChange={(e) => setInlineWithdraw((p) => ({ ...p, beneficiary_mobile: e.target.value.replace(/\D/g, "").slice(0, 10) }))} placeholder="Enter beneficiary mobile number" required /><small>10 digits</small></label>
                    <label>Account Type *<select value={inlineWithdraw.account_type} onChange={(e) => setInlineWithdraw((p) => ({ ...p, account_type: e.target.value }))}><option value="Savings Account">Savings Account</option><option value="Current Account">Current Account</option></select></label>
                  </div>
                  <div className="role-wallet-actions">
                    <button type="button" className="secondary" onClick={() => setInlineWithdraw((p) => ({ ...p, amount: "" }))}>Reset</button>
                    <button type="submit" disabled={walletActionLoading}>{walletActionLoading ? "Processing..." : "TRANSFER FUNDS"}</button>
                  </div>
                </form>
              )}
            </section>
          </>
        )}

        {role === "retailer" && activeSection === "wallet" && (
          <>
            <section className="role-stat-grid">
              <div className="role-stat-card blue"><span>Wallet Balance</span><strong>{formatCurrency(retailerDashboard?.wallet_balance || mainWallet?.balance)}</strong></div>
            </section>
            <section className="role-panel role-wallet-panel">
              <div className="role-wallet-header">
                <div>
                  <h4>Wallet</h4>
                  <p className="muted">Add funds or withdraw to your wallet</p>
                </div>
                <div className="role-wallet-balance-card">
                  <span>Balance</span>
                  <strong>{formatCurrency(mainWallet?.balance || 0)}</strong>
                </div>
              </div>

              <div className="role-wallet-tabs">
                <button type="button" className={walletActionTab === "deposit" ? "active" : ""} onClick={() => setWalletActionTab("deposit")}>Add Funds</button>
                <button type="button" className={walletActionTab === "withdraw" ? "active" : ""} onClick={() => setWalletActionTab("withdraw")}>Withdraw Funds</button>
              </div>

              {walletActionTab === "deposit" ? (
                <form className="role-wallet-form" onSubmit={handleInlineDepositSubmit}>
                  <p className="muted">Fill the form below to add funds to your wallet</p>
                  <div className="role-wallet-grid">
                    <label>Customer Name *<input value={inlineDeposit.customer_name} onChange={(e) => setInlineDeposit((p) => ({ ...p, customer_name: e.target.value }))} placeholder="Enter customer name" required /></label>
                    <label>Mobile Number *<input value={inlineDeposit.mobile} maxLength={10} onChange={(e) => setInlineDeposit((p) => ({ ...p, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) }))} placeholder="Enter mobile number" required /><small>10 digits</small></label>
                    <label>Email Address *<input type="email" value={inlineDeposit.email} onChange={(e) => setInlineDeposit((p) => ({ ...p, email: e.target.value }))} placeholder="Enter email address" required /></label>
                    <label>Amount to Pay *<div className="role-wallet-input-icon"><span>₹</span><input type="number" min="1" step="0.01" value={inlineDeposit.amount} onChange={(e) => setInlineDeposit((p) => ({ ...p, amount: e.target.value }))} placeholder="Enter amount" required /></div><small>Enter amount in INR</small></label>
                    <label>Payment Category *<select value={inlineDeposit.category} onChange={(e) => setInlineDeposit((p) => ({ ...p, category: e.target.value }))}><option value="education">Education</option></select><small>Only Education available</small></label>
                    <label>Transaction Date<input value={inlineDeposit.transaction_date} readOnly /></label>
                  </div>
                  <div className="role-wallet-actions">
                    <button type="button" className="secondary" onClick={() => setInlineDeposit((p) => ({ ...p, amount: "" }))}>Reset</button>
                    <button type="submit" disabled={walletActionLoading}>{walletActionLoading ? "Processing..." : "PAY NOW"}</button>
                  </div>
                </form>
              ) : (
                <form className="role-wallet-form" onSubmit={handleInlineWithdrawSubmit}>
                  <div className="role-wallet-info">Wallet E Fund Transfer<br />Funds will be transferred via Wallet E Connected Banking API<br /><strong>Available Balance: {formatCurrency(mainWallet?.balance || 0)}</strong></div>
                  <div className="role-wallet-grid">
                    <label>Payment Mode *<select value={inlineWithdraw.payment_mode} onChange={(e) => setInlineWithdraw((p) => ({ ...p, payment_mode: e.target.value }))}><option value="IMPS">IMPS</option><option value="NEFT">NEFT</option><option value="RTGS">RTGS</option></select></label>
                    <label>Amount *<div className="role-wallet-input-icon"><span>₹</span><input type="number" min="1" step="0.01" value={inlineWithdraw.amount} onChange={(e) => setInlineWithdraw((p) => ({ ...p, amount: e.target.value }))} placeholder="Enter amount" required /></div><small>Minimum ₹1</small></label>
                    <label>Account Number *<input value={inlineWithdraw.account_number} onChange={(e) => setInlineWithdraw((p) => ({ ...p, account_number: e.target.value.replace(/\D/g, "") }))} placeholder="Enter account number" required /><small>Minimum 9 digits</small></label>
                    <label>IFSC Code *<input value={inlineWithdraw.ifsc_code} onChange={(e) => setInlineWithdraw((p) => ({ ...p, ifsc_code: e.target.value.toUpperCase() }))} placeholder="Enter IFSC code" required /><small>11 characters (Format: ABCD0123456)</small></label>
                    <label>Account Holder Name *<input value={inlineWithdraw.account_holder_name} onChange={(e) => setInlineWithdraw((p) => ({ ...p, account_holder_name: e.target.value }))} placeholder="Enter account holder name" required /></label>
                    <label>Beneficiary Mobile No *<input value={inlineWithdraw.beneficiary_mobile} maxLength={10} onChange={(e) => setInlineWithdraw((p) => ({ ...p, beneficiary_mobile: e.target.value.replace(/\D/g, "").slice(0, 10) }))} placeholder="Enter beneficiary mobile number" required /><small>10 digits</small></label>
                    <label>Account Type *<select value={inlineWithdraw.account_type} onChange={(e) => setInlineWithdraw((p) => ({ ...p, account_type: e.target.value }))}><option value="Savings Account">Savings Account</option><option value="Current Account">Current Account</option></select></label>
                  </div>
                  <div className="role-wallet-actions">
                    <button type="button" className="secondary" onClick={() => setInlineWithdraw((p) => ({ ...p, amount: "" }))}>Reset</button>
                    <button type="submit" disabled={walletActionLoading}>{walletActionLoading ? "Processing..." : "TRANSFER FUNDS"}</button>
                  </div>
                  <div className="role-actions" style={{ marginTop: "8px" }}>
                    <button type="button" className="secondary" onClick={handleRequestWithdrawOtp}>Generate OTP</button>
                  </div>
                </form>
              )}
            </section>
          </>
        )}

        {role === "distributor" && activeSection === "performance" && (
          <>
            <section className="role-stat-grid">
              <div className="role-stat-card teal"><span>Weekly Withdraw</span><strong>{formatCurrency(distributorPerformance?.retailer_withdraw_summary?.weekly)}</strong></div>
              <div className="role-stat-card gold"><span>Monthly Withdraw</span><strong>{formatCurrency(distributorPerformance?.retailer_withdraw_summary?.monthly)}</strong></div>
              <div className="role-stat-card pink"><span>Bonus Commission</span><strong>{formatCurrency(distributorPerformance?.bonus?.bonus_commission)}</strong></div>
              <div className="role-stat-card green"><span>Total Incentives</span><strong>{formatCurrency(distributorPerformance?.bonus?.total_bonus)}</strong></div>
            </section>
            <section className="role-content-grid">
              <article className="role-panel">
                <h4>Weekly Graph</h4>
                <table className="role-table">
                  <thead><tr><th>Day</th><th>Withdraw Amount</th></tr></thead>
                  <tbody>
                    {(distributorPerformance?.weekly_chart || []).map((item) => (
                      <tr key={item.label}>
                        <td>{item.label}</td>
                        <td>{formatCurrency(item.withdraw)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </article>
              <article className="role-panel">
                <h4>Monthly Graph</h4>
                <table className="role-table">
                  <thead><tr><th>Month</th><th>Withdraw</th><th>Commission</th></tr></thead>
                  <tbody>
                    {(distributorPerformance?.monthly_chart || []).map((item) => (
                      <tr key={item.label}>
                        <td>{item.label}</td>
                        <td>{formatCurrency(item.withdraw)}</td>
                        <td>{formatCurrency(item.commission)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </article>
            </section>
          </>
        )}

        {showMasterUsersSection && (
          <>
            <section className="role-panel">
              <h4>Create {managedChildLabel}</h4>
                <form className="role-form role-wizard" onSubmit={handleCreateDistributor}>
                  <div className="role-wizard-steps">
                    <button type="button" className={`role-wizard-step ${distributorCreateStep === 1 ? "active" : ""}`} onClick={() => setDistributorCreateStep(1)}>Personal Information</button>
                    <span className="role-wizard-divider" />
                    <button type="button" className={`role-wizard-step ${distributorCreateStep === 2 ? "active" : ""}`} onClick={() => setDistributorCreateStep(2)}>User eKYC</button>
                    <span className="role-wizard-divider" />
                    <button type="button" className={`role-wizard-step ${distributorCreateStep === 3 ? "active" : ""}`} onClick={() => setDistributorCreateStep(3)}>Bank Information</button>
                    <span className="role-wizard-divider" />
                    <button type="button" className={`role-wizard-step ${distributorCreateStep === 4 ? "active" : ""}`} onClick={() => setDistributorCreateStep(4)}>Commission Settings</button>
                  </div>

                  <div className="role-wizard-body">
                    {distributorCreateStep === 1 && (
                      <div className="role-wizard-section">
                        <h5>Personal Information</h5>
                        <div className="role-wizard-grid">
                          <label className="role-field-label">First Name *<input placeholder="First Name" value={newDistributor.name} onChange={(e) => setNewDistributor((p) => ({ ...p, name: e.target.value }))} required /></label>
                          <label className="role-field-label">Last Name *<input placeholder="Last Name" value={newDistributor.last_name} onChange={(e) => setNewDistributor((p) => ({ ...p, last_name: e.target.value }))} /></label>
                          <label className="role-field-label">Date of Birth<input type="date" value={newDistributor.date_of_birth} onChange={(e) => setNewDistributor((p) => ({ ...p, date_of_birth: e.target.value }))} required /></label>
                          <label className="role-field-label">Email Address *<input placeholder="Email Address" type="email" value={newDistributor.email} onChange={(e) => setNewDistributor((p) => ({ ...p, email: e.target.value }))} required /></label>
                          <label className="role-field-label">Mobile Number *<input placeholder="Mobile Number" value={newDistributor.phone} maxLength={10} onChange={(e) => setNewDistributor((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))} required /></label>
                          <label className="role-field-label">Alternative Mobile Number<input placeholder="Alternative Mobile Number" value={newDistributor.alternate_mobile} maxLength={10} onChange={(e) => setNewDistributor((p) => ({ ...p, alternate_mobile: e.target.value.replace(/\D/g, "").slice(0, 10) }))} /></label>
                          <label className="role-field-label">Business Name *<input placeholder="Business Name" value={newDistributor.business_name} onChange={(e) => setNewDistributor((p) => ({ ...p, business_name: e.target.value }))} /></label>
                          <label className="role-field-label">Company Name<input placeholder="Company Name (optional)" /></label>
                          <label className="role-field-label">Address *<input placeholder="Address" value={newDistributor.address} onChange={(e) => setNewDistributor((p) => ({ ...p, address: e.target.value }))} /></label>
                          <label className="role-field-label">GST Number<input placeholder="GST Number" value={newDistributor.gst_number} onChange={(e) => setNewDistributor((p) => ({ ...p, gst_number: e.target.value.toUpperCase() }))} /></label>
                          <label className="role-field-label">State *<select value={newDistributor.state} onChange={(e) => setNewDistributor((p) => ({ ...p, state: e.target.value }))}><option value="">Select State</option>{INDIA_STATES.map((stateName) => (<option key={stateName} value={stateName}>{stateName}</option>))}</select></label>
                          <label className="role-field-label">City *<input placeholder="City" value={newDistributor.city} onChange={(e) => setNewDistributor((p) => ({ ...p, city: e.target.value }))} /></label>
                          <label className="role-field-label">Pincode *<input placeholder="Pincode" value={newDistributor.pincode} maxLength={6} onChange={(e) => setNewDistributor((p) => ({ ...p, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))} /></label>
                          <label className="role-field-label">Upload Photo<div className="role-upload-wrap"><input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => handleDistributorFileChange("profile_photo", e.target.files?.[0] || null)} /><div className="role-upload-help">Upload Photo, max size 2MB</div></div></label>
                          <label className="role-field-label">Password *<input placeholder="Password" type="password" value={newDistributor.password} onChange={(e) => setNewDistributor((p) => ({ ...p, password: e.target.value }))} required /></label>
                          <label className="role-field-label">Confirm Password *<input placeholder="Confirm Password" type="password" value={newDistributor.password_confirmation} onChange={(e) => setNewDistributor((p) => ({ ...p, password_confirmation: e.target.value }))} required /></label>
                        </div>
                        <div className="role-wizard-actions"><span /><button type="button" onClick={() => { if (validateCreateBasicStep(newDistributor)) setDistributorCreateStep(2); }}>Next</button></div>
                      </div>
                    )}

                    {distributorCreateStep === 2 && (
                      <div className="role-wizard-section">
                        <h5>User eKYC</h5>
                        <div className="role-wizard-grid">
                          <label className="role-field-label">Document Type *<select value={newDistributor.kyc_document_type} onChange={(e) => setNewDistributor((p) => ({ ...p, kyc_document_type: e.target.value }))}><option value="">Select Document Type</option>{KYC_DOCUMENT_TYPES.map((docType) => (<option key={docType} value={docType}>{docType}</option>))}</select></label>
                          <label className="role-field-label">Document Number *<input placeholder="Aadhaar Number" value={newDistributor.kyc_id_number} maxLength={12} onChange={(e) => setNewDistributor((p) => ({ ...p, kyc_id_number: e.target.value.replace(/\D/g, "").slice(0, 12) }))} /></label>
                          <label className="role-field-label">Upload Document Front *<div className="role-upload-wrap"><input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(e) => handleDistributorFileChange("address_proof_front", e.target.files?.[0] || null)} /><div className="role-upload-help">Required by backend validation</div></div></label>
                          <label className="role-field-label">Upload Document Back *<div className="role-upload-wrap"><input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(e) => handleDistributorFileChange("address_proof_back", e.target.files?.[0] || null)} /><div className="role-upload-help">Required by backend validation</div></div></label>
                          <label className="role-field-label">Upload KYC Document<div className="role-upload-wrap"><input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(e) => handleDistributorFileChange("kyc_photo", e.target.files?.[0] || null)} /></div></label>
                        </div>
                        <div className="role-upload-preview">
                          <strong>Image Preview</strong>
                          <div className="role-upload-preview-grid">
                            {distributorImagePreview.profile_photo && <img src={distributorImagePreview.profile_photo} alt="Profile preview" />}
                            {distributorImagePreview.address_proof_front && <img src={distributorImagePreview.address_proof_front} alt="Document front preview" />}
                            {distributorImagePreview.address_proof_back && <img src={distributorImagePreview.address_proof_back} alt="Document back preview" />}
                          </div>
                        </div>
                        <div className="role-wizard-actions"><button type="button" className="secondary" onClick={() => setDistributorCreateStep(1)}>Previous</button><button type="button" onClick={() => setDistributorCreateStep(3)}>Next</button></div>
                      </div>
                    )}

                    {distributorCreateStep === 3 && (
                      <div className="role-wizard-section">
                        <h5>Bank Information</h5>
                        <div className="role-wizard-grid">
                          <label className="role-field-label">Account Holder Name *<input placeholder="Account holder name" value={newDistributor.bank_account_name} onChange={(e) => setNewDistributor((p) => ({ ...p, bank_account_name: e.target.value }))} /></label>
                          <label className="role-field-label">Bank Name *<input placeholder="Bank Name" value={newDistributor.bank_name} onChange={(e) => setNewDistributor((p) => ({ ...p, bank_name: e.target.value }))} /></label>
                          <label className="role-field-label">Account Number *<input placeholder="Account Number" value={newDistributor.bank_account_number} onChange={(e) => setNewDistributor((p) => ({ ...p, bank_account_number: e.target.value }))} /></label>
                          <label className="role-field-label">IFSC Code *<input placeholder="IFSC Code" value={newDistributor.bank_ifsc_code} onChange={(e) => setNewDistributor((p) => ({ ...p, bank_ifsc_code: e.target.value }))} /></label>
                        </div>
                        <div className="role-wizard-actions"><button type="button" className="secondary" onClick={() => setDistributorCreateStep(2)}>Previous</button><button type="button" onClick={() => setDistributorCreateStep(4)}>Next</button></div>
                      </div>
                    )}

                    {distributorCreateStep === 4 && (
                      <div className="role-wizard-section">
                        <h5>Commission Settings</h5>
                        <div className="role-wizard-grid">
                          <label className="role-field-label">Role<input value={managedChildLabel} readOnly /></label>
                          <label className="role-field-label">Mobility Check<select value={newDistributor.mobility_check} onChange={(e) => setNewDistributor((p) => ({ ...p, mobility_check: e.target.value }))}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
                          <label className="role-field-label">Admin Commission (%)<input type="number" min="0" max="100" step="0.01" value={newDistributor.admin_commission} onChange={(e) => setNewDistributor((p) => ({ ...p, admin_commission: e.target.value }))} placeholder="Commission rate" /></label>
                          <label className="role-field-label">Distributor Commission (%)<input type="number" min="0" max="100" step="0.01" value={newDistributor.distributor_commission} onChange={(e) => setNewDistributor((p) => ({ ...p, distributor_commission: e.target.value }))} placeholder="Distributor commission" /></label>
                        </div>
                        <p className="role-wizard-note"><strong>Note:</strong> Commission settings are optional and kept for same flow UI.</p>
                        <div className="role-wizard-actions"><button type="button" className="secondary" onClick={() => setDistributorCreateStep(3)}>Previous</button><button type="submit">Create {managedChildLabel}</button></div>
                      </div>
                    )}
                  </div>
                </form>
            </section>

            <section className="role-panel">
              <h4>{managedChildLabel} Management</h4>
              <table className="role-table">
                <thead><tr><th>Name</th><th>Email</th><th>Balance</th><th>Retailers</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {(managerData?.distributors || []).map((distributor) => (
                    <tr key={distributor.id}>
                      <td>{distributor.name}</td>
                      <td>{distributor.email}</td>
                      <td>{formatCurrency(distributor.balance)}</td>
                      <td>{distributor.total_retailers || 0}</td>
                      <td>{distributor.is_active ? "Active" : "Inactive"}</td>
                      <td>
                        <div className="role-actions">
                          <button type="button" onClick={() => handleDistributorToggle(distributor.id)}>
                            {distributor.is_active ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}

        {(role === "master_distributor" || role === "super_distributor") && activeSection === "user-management" && userManagementTab === "roles" && (
          <>
            <section className="role-stat-grid">
              <div className="role-stat-card green"><span>{isMasterRole ? "Total Super Distributors" : "Total Distributors"}</span><strong>{managerData?.total_distributors || 0}</strong></div>
              <div className="role-stat-card blue"><span>{isMasterRole ? "Active Super Distributors" : "Active Distributors"}</span><strong>{(managerData?.distributors || []).filter((item) => item.is_active).length}</strong></div>
              <div className="role-stat-card pink"><span>{isMasterRole ? "Inactive Super Distributors" : "Inactive Distributors"}</span><strong>{(managerData?.distributors || []).filter((item) => !item.is_active).length}</strong></div>
              <div className="role-stat-card indigo"><span>Total Retailers</span><strong>{(managerData?.distributors || []).reduce((sum, item) => sum + Number(item.total_retailers || 0), 0)}</strong></div>
            </section>
            <section className="role-panel">
              <h4>Roles</h4>
              <table className="role-table">
                <thead><tr><th>Role</th><th>Total</th><th>Active</th><th>Inactive</th></tr></thead>
                <tbody>
                  <tr>
                    <td>{isMasterRole ? "Master Distributor" : "Super Distributor"}</td>
                    <td>1</td>
                    <td>{user?.is_active === false ? 0 : 1}</td>
                    <td>{user?.is_active === false ? 1 : 0}</td>
                  </tr>
                  <tr>
                    <td>{isMasterRole ? "Super Distributor" : "Distributor"}</td>
                    <td>{managerData?.total_distributors || 0}</td>
                    <td>{(managerData?.distributors || []).filter((item) => item.is_active).length}</td>
                    <td>{(managerData?.distributors || []).filter((item) => !item.is_active).length}</td>
                  </tr>
                  <tr>
                    <td>Retailer</td>
                    <td>{(managerData?.distributors || []).reduce((sum, item) => sum + Number(item.total_retailers || 0), 0)}</td>
                    <td>-</td>
                    <td>-</td>
                  </tr>
                </tbody>
              </table>
            </section>
          </>
        )}

        {role === "distributor" && activeSection === "withdrawals" && (
          <section className="role-panel">
            <h4>Retailer Withdraw Requests</h4>
            <table className="role-table">
              <thead><tr><th>Date</th><th>Retailer</th><th>Amount</th><th>Net</th><th>Status</th><th>Remarks</th><th>Action</th></tr></thead>
              <tbody>
                {distributorWithdrawRequests.map((wr) => (
                  <tr key={wr.id}>
                    <td>{new Date(wr.created_at).toLocaleString()}</td>
                    <td>{wr.user?.name || "-"}</td>
                    <td>{formatCurrency(wr.amount)}</td>
                    <td>{formatCurrency(wr.net_amount)}</td>
                    <td className="text-capitalize">{wr.status}</td>
                    <td>
                      <input
                        placeholder="Remarks"
                        value={withdrawRemarksDraft[wr.id] ?? wr.remarks ?? ""}
                        onChange={(e) => setWithdrawRemarksDraft((p) => ({ ...p, [wr.id]: e.target.value }))}
                        disabled={!['pending', 'approved'].includes(wr.status)}
                      />
                    </td>
                    <td>
                      {['pending', 'approved'].includes(wr.status) ? (
                        <div className="role-actions">
                          <button type="button" onClick={() => handleWithdrawRequestDecision(wr.id, "approve")}>Approve</button>
                          <button type="button" className="secondary" onClick={() => handleWithdrawRequestDecision(wr.id, "reject")}>Reject</button>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {activeSection === "transactions" && (
          <section className={`role-panel ${role === "retailer" ? "role-retailer-history" : ""}`}>
            <h4>{role === "retailer" ? (retailerTransactionTab === "payin" ? "Payin History" : "Payouts History") : "All Transactions"}</h4>
            {role === "retailer" && (
              <>
                <div className="role-actions role-retailer-history-actions">
                  <button
                    type="button"
                    onClick={retailerTransactionTab === "payin" ? handleRetailerExport : handleRetailerPayoutExport}
                  >
                    Export CSV
                  </button>
                  <button type="button" className="secondary" onClick={handleRetailerHistoryRefresh}>Refresh</button>
                </div>

                {retailerTransactionTab === "payin" ? (
                  <div className="role-commission-grid role-retailer-history-stats">
                    <div className="role-chip">Total Payin Volume: <strong>{formatCurrency(payinStats.totalVolume)}</strong></div>
                    <div className="role-chip">Successful Transactions: <strong>{payinStats.successCount}</strong></div>
                    <div className="role-chip">Pending Transactions: <strong>{payinStats.pendingCount}</strong></div>
                    <div className="role-chip">Failed Transactions: <strong>{payinStats.failedCount}</strong></div>
                  </div>
                ) : (
                  <div className="role-commission-grid role-retailer-history-stats">
                    <div className="role-chip">Total Payout Volume: <strong>{formatCurrency(payoutStats.totalVolume)}</strong></div>
                    <div className="role-chip">Processed Payouts: <strong>{payoutStats.processedCount}</strong></div>
                    <div className="role-chip">Pending Payouts: <strong>{payoutStats.pendingCount}</strong></div>
                    <div className="role-chip">Failed Payouts: <strong>{payoutStats.failedCount}</strong></div>
                  </div>
                )}

                {retailerTransactionTab === "payin" ? (
                  <form className="role-filter-grid" onSubmit={(e) => { e.preventDefault(); loadTransactionsWithFilters(); }}>
                    <select value={transactionFilters.type} onChange={(e) => setTransactionFilters((p) => ({ ...p, type: e.target.value }))}>
                      <option value="">All types</option>
                      <option value="deposit">Deposit</option>
                      <option value="withdraw">Withdraw</option>
                      <option value="transfer">Transfer</option>
                      <option value="receive">Receive</option>
                    </select>
                    <input type="date" value={transactionFilters.start_date} onChange={(e) => setTransactionFilters((p) => ({ ...p, start_date: e.target.value }))} />
                    <input type="date" value={transactionFilters.end_date} onChange={(e) => setTransactionFilters((p) => ({ ...p, end_date: e.target.value }))} />
                    <input
                      type="text"
                      placeholder="Search by id, type, amount, details"
                      value={retailerPayinSearch}
                      onChange={(e) => setRetailerPayinSearch(e.target.value)}
                    />
                    <select value={retailerPayinStatusFilter} onChange={(e) => setRetailerPayinStatusFilter(e.target.value)}>
                      <option value="all">All status</option>
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                      <option value="approved">Approved</option>
                    </select>
                    <button type="submit">Apply Filter</button>
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => {
                        setTransactionFilters({ type: "", start_date: "", end_date: "" });
                        setRetailerPayinSearch("");
                        setRetailerPayinStatusFilter("all");
                        loadRetailerData();
                      }}
                    >
                      Clear All
                    </button>
                  </form>
                ) : (
                  <div className="role-filter-grid">
                    <input
                      type="text"
                      placeholder="Search by transaction id, remarks, amount"
                      value={retailerPayoutSearch}
                      onChange={(e) => setRetailerPayoutSearch(e.target.value)}
                    />
                    <select value={retailerPayoutStatusFilter} onChange={(e) => setRetailerPayoutStatusFilter(e.target.value)}>
                      <option value="all">All status</option>
                      <option value="approved">Processed</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => {
                        setRetailerPayoutSearch("");
                        setRetailerPayoutStatusFilter("all");
                      }}
                    >
                      Clear All
                    </button>
                  </div>
                )}
                <p className="muted role-retailer-history-meta">
                  {retailerTransactionTab === "payin"
                    ? `Showing ${filteredRetailerPayins.length} payin records`
                    : `Showing ${filteredRetailerPayouts.length} payout records | Net Volume: ${formatCurrency(payoutStats.netVolume)}`}
                </p>
              </>
            )}
            {role === "retailer" && retailerTransactionTab === "payouts" ? (
              <table className="role-table">
                <thead><tr><th>Transaction ID</th><th>Date</th><th>Amount</th><th>Net</th><th>Status</th><th>Remarks</th></tr></thead>
                <tbody>
                  {filteredRetailerPayouts.map((wr) => (
                    <tr key={wr.id}>
                      <td>{wr.reference || wr.transaction_id || `PAYOUT-${wr.id}`}</td>
                      <td>{new Date(wr.created_at).toLocaleString()}</td>
                      <td>{formatCurrency(wr.amount)}</td>
                      <td>{formatCurrency(wr.net_amount)}</td>
                      <td className="text-capitalize">{wr.status}</td>
                      <td>{wr.remarks || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="role-table">
                <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Status</th><th>Reference</th><th>Details</th></tr></thead>
                <tbody>
                  {(role === "retailer" ? filteredRetailerPayins : visibleTransactions).map((tx) => (
                    <tr key={tx.id}>
                      <td>{new Date(tx.created_at).toLocaleString()}</td>
                      <td className="text-capitalize">{tx.type}</td>
                      <td>{formatCurrency(tx.amount)}</td>
                      <td className="text-capitalize">{tx.status || "completed"}</td>
                      <td>{tx.reference || `TXN-${tx.id}`}</td>
                      <td>{tx.description || tx.reference || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {role === "retailer" && activeSection === "recharge" && (
          <section className="role-panel role-recharge-wrap">
            <div className="role-recharge-header-card">
              <div>
                <h4>Recharge & Bill Payments</h4>
                <p>Fast mobile, DTH and utility payments for your retailer account.</p>
              </div>
              <div className="role-recharge-balance-pill">
                <span>Wallet Balance</span>
                <strong>{formatCurrency(retailerDashboard?.wallet_balance || mainWallet?.balance || 0)}</strong>
              </div>
            </div>

            <div className="role-recharge-service-strip" role="tablist" aria-label="Recharge services">
              {RECHARGE_SERVICES.map((service) => (
                <button
                  key={service.key}
                  type="button"
                  className={`role-recharge-service-item ${selectedRechargeService === service.key ? "active" : ""}`}
                  onClick={() => {
                    setSelectedRechargeService(service.key);
                    setRechargeOperatorSearch("");
                  }}
                >
                  <span className="role-recharge-service-icon" aria-hidden="true">{service.symbol}</span>
                  <span>{service.label}</span>
                </button>
              ))}
            </div>

            <div className="role-recharge-first-layout">
              {selectedRechargeService === "electricity" ? (
                <form className="role-recharge-first-card role-electricity-card" onSubmit={handleRechargeSubmit}>
                  <h5>{electricityBillType === "apartments" ? "Pay Apartment Bills" : "Pay Electricity Bill"}</h5>

                  <div className="role-recharge-radio-group" role="radiogroup" aria-label="Electricity bill type">
                    <label>
                      <input
                        type="radio"
                        name="electricityBillType"
                        checked={electricityBillType === "electricity-boards"}
                        onChange={() => setElectricityBillType("electricity-boards")}
                      />
                      <span>Electricity Boards</span>
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="electricityBillType"
                        checked={electricityBillType === "apartments"}
                        onChange={() => setElectricityBillType("apartments")}
                      />
                      <span>Apartments</span>
                    </label>
                  </div>

                  {electricityBillType === "apartments" ? (
                    <>
                      <label className="role-recharge-line-field role-bharat-connect-field">
                        <span>City</span>
                        <input
                          value={electricityCity}
                          onChange={(e) => setElectricityCity(e.target.value)}
                          placeholder="Enter city"
                          required
                        />
                        <small className="role-bharat-connect-tag">Bharat Connect</small>
                      </label>

                      <label className="role-recharge-line-field role-bharat-connect-field">
                        <span>Apartment</span>
                        <input
                          value={electricityApartment}
                          onChange={(e) => setElectricityApartment(e.target.value)}
                          placeholder="Enter apartment name"
                          required
                        />
                        <small className="role-bharat-connect-tag">Bharat Connect</small>
                      </label>

                      <label className="role-recharge-line-field">
                        <span>Flat No</span>
                        <input
                          value={electricityFlatNo}
                          onChange={(e) => setElectricityFlatNo(e.target.value)}
                          placeholder="Enter flat number"
                          required
                        />
                      </label>

                      <label className="role-recharge-line-field">
                        <span>Mobile Number</span>
                        <input
                          value={electricityMobile}
                          onChange={(e) => setElectricityMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          placeholder="Please enter your Mobile Number"
                          maxLength={10}
                          required
                        />
                        <small className="role-electricity-help">Please enter your Mobile Number</small>
                      </label>
                    </>
                  ) : (
                    <>
                      <label className="role-recharge-line-field">
                        <span>State</span>
                        <select
                          value={electricityState}
                          onChange={(e) => setElectricityState(e.target.value)}
                          required
                        >
                          {INDIA_STATES.map((stateName) => (
                            <option key={stateName} value={stateName}>{stateName}</option>
                          ))}
                        </select>
                      </label>

                      <label className="role-recharge-line-field role-bharat-connect-field">
                        <span>Electricity Board</span>
                        <select
                          value={electricityBoard}
                          onChange={(e) => setElectricityBoard(e.target.value)}
                          required
                        >
                          {ELECTRICITY_BOARD_OPTIONS.map((boardName) => (
                            <option key={boardName} value={boardName}>{boardName}</option>
                          ))}
                        </select>
                        <small className="role-bharat-connect-tag">Bharat Connect</small>
                      </label>

                      <label className="role-recharge-line-field role-recharge-line-inline">
                        <span>Service Number</span>
                        <input
                          value={electricityServiceNumber}
                          onChange={(e) => setElectricityServiceNumber(e.target.value)}
                          placeholder="Enter service number"
                          required
                        />
                        <button type="button" className="role-recharge-link role-recharge-inline-link">View Sample Bill</button>
                      </label>
                    </>
                  )}

                  <button type="submit" className="role-recharge-primary-btn">Proceed</button>

                  {electricityBillType === "apartments" ? (
                    <p className="role-electricity-note">
                      Apartment office might take a day to reflect this payment in your account statement.
                    </p>
                  ) : (
                    <p className="role-electricity-note">
                      By continuing, bill fetch reminders can be enabled for current and future electricity bills.
                    </p>
                  )}
                </form>
              ) : selectedRechargeService === "dth" ? (
                <>
                  <form className="role-recharge-first-card role-dth-card" onSubmit={handleRechargeSubmit}>
                    <h5>Recharge DTH or TV</h5>

                    <label className="role-recharge-line-field">
                      <span>Search DTH Operator</span>
                      <input
                        value={rechargeOperatorSearch}
                        onChange={(e) => setRechargeOperatorSearch(e.target.value)}
                        placeholder="Search by operator name"
                      />
                    </label>

                    <label className="role-recharge-line-field">
                      <span>DTH Operator</span>
                      <button
                        type="button"
                        className="role-dth-operator-trigger"
                        onClick={() => setDthOperatorPickerOpen((prev) => !prev)}
                      >
                        {dthOperator}
                      </button>
                      {dthOperatorPickerOpen && (
                        <div className="role-dth-operator-picker">
                          <div className="role-dth-operator-picker-head">
                            <strong>DTH Operator</strong>
                            <button type="button" onClick={() => setDthOperatorPickerOpen(false)}>✕</button>
                          </div>
                          <div className="role-dth-operator-picker-list">
                            {DTH_OPERATORS.map((operator) => (
                              <button
                                key={operator.key}
                                type="button"
                                className={`role-dth-operator-item ${dthOperator === operator.key ? "active" : ""}`}
                                onClick={() => {
                                  setDthOperator(operator.key);
                                  setDthOperatorPickerOpen(false);
                                }}
                              >
                                <span
                                  className={`role-recharge-operator-logo role-dth-picker-logo ${operator.logoClass}`}
                                  style={{ backgroundColor: operator.color, color: operator.textColor }}
                                >
                                  {operator.mark}
                                </span>
                                <span>{operator.key}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </label>

                    <label className="role-recharge-line-field">
                      <span>Mobile Number or Subscriber ID</span>
                      <input
                        value={dthSubscriberId}
                        onChange={(e) => setDthSubscriberId(e.target.value)}
                        placeholder="Enter mobile number or subscriber id"
                        required
                      />
                    </label>

                    <div className="role-recharge-quick-amounts" role="group" aria-label="Quick DTH amounts">
                      {RECHARGE_QUICK_AMOUNTS.map((amount) => (
                        <button
                          key={`dth-quick-${amount}`}
                          type="button"
                          className={`role-recharge-quick-chip ${String(rechargeAmount) === String(amount) ? "active" : ""}`}
                          onClick={() => setRechargeAmount(String(amount))}
                        >
                          ₹{amount}
                        </button>
                      ))}
                    </div>

                    <button type="submit" className="role-recharge-primary-btn">Proceed to Recharge</button>
                    <p className="role-dth-note">Bharat Connect</p>
                  </form>

                  <section className="role-recharge-operator-panel">
                    <h5>DTH Operator</h5>
                    <div className="role-recharge-operator-grid">
                      {filteredRechargeOperators.map((operator) => (
                        <button
                          key={operator.key}
                          type="button"
                          className={`role-recharge-operator-card ${dthOperator === operator.key ? "active" : ""}`}
                          onClick={() => setDthOperator(operator.key)}
                        >
                          <span
                            className={`role-recharge-operator-logo ${operator.logoClass}`}
                            style={{ backgroundColor: operator.color, color: operator.textColor }}
                          >
                            {operator.mark}
                          </span>
                          <span>{operator.title}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                </>
              ) : selectedRechargeService === "metro" ? (
                <>
                  <form className="role-recharge-first-card" onSubmit={handleRechargeSubmit}>
                    <h5>Recharge Metro Card</h5>

                    <label className="role-recharge-line-field">
                      <span>Search Metro Operator</span>
                      <input
                        value={rechargeOperatorSearch}
                        onChange={(e) => setRechargeOperatorSearch(e.target.value)}
                        placeholder="Search metro operator"
                      />
                    </label>

                    <label className="role-recharge-line-field">
                      <span>Metro Operator</span>
                      <input value={metroOperator} placeholder="Select operator" readOnly required />
                    </label>

                    <label className="role-recharge-line-field">
                      <span>Metro Card Number</span>
                      <input
                        value={metroCardNumber}
                        onChange={(e) => setMetroCardNumber(e.target.value)}
                        placeholder="Enter metro smart card number"
                        required
                      />
                    </label>

                    <label className="role-recharge-line-field role-recharge-amount-field">
                      <span>Amount</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={metroAmount}
                        onChange={(e) => setMetroAmount(e.target.value)}
                        placeholder="Enter amount"
                        required
                      />
                    </label>

                    <div className="role-recharge-quick-amounts" role="group" aria-label="Quick metro amounts">
                      {RECHARGE_QUICK_AMOUNTS.map((amount) => (
                        <button
                          key={`metro-quick-${amount}`}
                          type="button"
                          className={`role-recharge-quick-chip ${String(metroAmount) === String(amount) ? "active" : ""}`}
                          onClick={() => setMetroAmount(String(amount))}
                        >
                          ₹{amount}
                        </button>
                      ))}
                    </div>

                    <button type="submit" className="role-recharge-primary-btn">Proceed to Recharge</button>
                    <p className="role-service-note">Step flow: Select metro operator → enter card number → choose amount → proceed.</p>
                  </form>

                  <section className="role-recharge-operator-panel">
                    <h5>Select Metro Operator</h5>
                    <div className="role-recharge-operator-grid">
                      {filteredRechargeOperators.map((operator) => (
                        <button
                          key={operator.key}
                          type="button"
                          className={`role-recharge-operator-card ${metroOperator === operator.key ? "active" : ""}`}
                          onClick={() => setMetroOperator(operator.key)}
                        >
                          <span
                            className={`role-recharge-operator-logo ${operator.logoClass || ""}`}
                            style={{ backgroundColor: operator.color, color: operator.textColor }}
                          >
                            {operator.mark}
                          </span>
                          <span>{operator.title}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                </>
              ) : selectedRechargeService === "broadband" ? (
                <>
                  <form className="role-recharge-first-card" onSubmit={handleRechargeSubmit}>
                    <h5>Pay Broadband Bill</h5>

                    <label className="role-recharge-line-field">
                      <span>Search Provider</span>
                      <input
                        value={rechargeOperatorSearch}
                        onChange={(e) => setRechargeOperatorSearch(e.target.value)}
                        placeholder="Search broadband provider"
                      />
                    </label>

                    <label className="role-recharge-line-field">
                      <span>Provider</span>
                      <input value={broadbandProvider} placeholder="Select provider" readOnly required />
                    </label>

                    <label className="role-recharge-line-field">
                      <span>Customer ID / Landline Number</span>
                      <input
                        value={broadbandAccountId}
                        onChange={(e) => setBroadbandAccountId(e.target.value)}
                        placeholder="Enter customer id or landline number"
                        required
                      />
                    </label>

                    <label className="role-recharge-line-field">
                      <span>Mobile Number (Optional)</span>
                      <input
                        value={broadbandMobile}
                        maxLength={10}
                        onChange={(e) => setBroadbandMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="Enter 10-digit mobile number"
                      />
                    </label>

                    <label className="role-recharge-line-field role-recharge-amount-field">
                      <span>Amount</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={broadbandAmount}
                        onChange={(e) => setBroadbandAmount(e.target.value)}
                        placeholder="Enter amount"
                        required
                      />
                    </label>

                    <button type="submit" className="role-recharge-primary-btn">Proceed to Pay Bill</button>
                    <p className="role-service-note">Step flow: Select provider → enter customer ID → enter amount → proceed.</p>
                  </form>

                  <section className="role-recharge-operator-panel">
                    <h5>Select Broadband Provider</h5>
                    <div className="role-recharge-operator-grid">
                      {filteredRechargeOperators.map((operator) => (
                        <button
                          key={operator.key}
                          type="button"
                          className={`role-recharge-operator-card ${broadbandProvider === operator.key ? "active" : ""}`}
                          onClick={() => setBroadbandProvider(operator.key)}
                        >
                          <span
                            className={`role-recharge-operator-logo ${operator.logoClass || ""}`}
                            style={{ backgroundColor: operator.color, color: operator.textColor }}
                          >
                            {operator.mark}
                          </span>
                          <span>{operator.title}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                </>
              ) : selectedRechargeService === "education" ? (
                <>
                  <form className="role-recharge-first-card" onSubmit={handleRechargeSubmit}>
                    <h5>Pay Education Fees</h5>

                    <label className="role-recharge-line-field">
                      <span>Search Category</span>
                      <input
                        value={rechargeOperatorSearch}
                        onChange={(e) => setRechargeOperatorSearch(e.target.value)}
                        placeholder="Search institute category"
                      />
                    </label>

                    <label className="role-recharge-line-field">
                      <span>Category</span>
                      <input value={educationInstitute} placeholder="Select category" readOnly required />
                    </label>

                    <label className="role-recharge-line-field">
                      <span>Student ID / Enrollment Number</span>
                      <input
                        value={educationStudentId}
                        onChange={(e) => setEducationStudentId(e.target.value)}
                        placeholder="Enter student id"
                        required
                      />
                    </label>

                    <label className="role-recharge-line-field role-recharge-amount-field">
                      <span>Fee Amount</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={educationAmount}
                        onChange={(e) => setEducationAmount(e.target.value)}
                        placeholder="Enter fee amount"
                        required
                      />
                    </label>

                    <button type="submit" className="role-recharge-primary-btn">Proceed to Pay Fee</button>
                    <p className="role-service-note">Step flow: Select category → enter student ID → enter fee amount → proceed.</p>
                  </form>

                  <section className="role-recharge-operator-panel">
                    <h5>Select Education Category</h5>
                    <div className="role-recharge-operator-grid">
                      {filteredRechargeOperators.map((operator) => (
                        <button
                          key={operator.key}
                          type="button"
                          className={`role-recharge-operator-card ${educationInstitute === operator.key ? "active" : ""}`}
                          onClick={() => setEducationInstitute(operator.key)}
                        >
                          <span
                            className={`role-recharge-operator-logo ${operator.logoClass || ""}`}
                            style={{ backgroundColor: operator.color, color: operator.textColor }}
                          >
                            {operator.mark}
                          </span>
                          <span>{operator.title}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                </>
              ) : selectedRechargeService === "insurance" ? (
                <>
                  <form className="role-recharge-first-card" onSubmit={handleRechargeSubmit}>
                    <h5>Pay Insurance Premium</h5>

                    <label className="role-recharge-line-field">
                      <span>Search Insurer</span>
                      <input
                        value={rechargeOperatorSearch}
                        onChange={(e) => setRechargeOperatorSearch(e.target.value)}
                        placeholder="Search insurance provider"
                      />
                    </label>

                    <label className="role-recharge-line-field">
                      <span>Insurance Provider</span>
                      <input value={insuranceProvider} placeholder="Select provider" readOnly required />
                    </label>

                    <label className="role-recharge-line-field">
                      <span>Policy Number</span>
                      <input
                        value={insurancePolicyNumber}
                        onChange={(e) => setInsurancePolicyNumber(e.target.value)}
                        placeholder="Enter policy number"
                        required
                      />
                    </label>

                    <label className="role-recharge-line-field">
                      <span>Mobile Number (Optional)</span>
                      <input
                        value={insuranceMobile}
                        maxLength={10}
                        onChange={(e) => setInsuranceMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="Enter 10-digit mobile number"
                      />
                    </label>

                    <label className="role-recharge-line-field role-recharge-amount-field">
                      <span>Premium Amount</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={insuranceAmount}
                        onChange={(e) => setInsuranceAmount(e.target.value)}
                        placeholder="Enter premium amount"
                        required
                      />
                    </label>

                    <button type="submit" className="role-recharge-primary-btn">Proceed to Pay Premium</button>
                    <p className="role-service-note">Step flow: Select insurer → enter policy number → enter premium amount → proceed.</p>
                  </form>

                  <section className="role-recharge-operator-panel">
                    <h5>Select Insurance Provider</h5>
                    <div className="role-recharge-operator-grid">
                      {filteredRechargeOperators.map((operator) => (
                        <button
                          key={operator.key}
                          type="button"
                          className={`role-recharge-operator-card ${insuranceProvider === operator.key ? "active" : ""}`}
                          onClick={() => setInsuranceProvider(operator.key)}
                        >
                          <span
                            className={`role-recharge-operator-logo ${operator.logoClass || ""}`}
                            style={{ backgroundColor: operator.color, color: operator.textColor }}
                          >
                            {operator.mark}
                          </span>
                          <span>{operator.title}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                </>
              ) : selectedRechargeService === "pay-loan" ? (
                <>
                  <form className="role-recharge-first-card" onSubmit={handleRechargeSubmit}>
                    <h5>Pay Loan EMI</h5>

                    <label className="role-recharge-line-field">
                      <span>Search Lender</span>
                      <input
                        value={rechargeOperatorSearch}
                        onChange={(e) => setRechargeOperatorSearch(e.target.value)}
                        placeholder="Search loan provider"
                      />
                    </label>

                    <label className="role-recharge-line-field">
                      <span>Loan Provider</span>
                      <input value={loanProvider} placeholder="Select lender" readOnly required />
                    </label>

                    <label className="role-recharge-line-field">
                      <span>Loan Account Number</span>
                      <input
                        value={loanAccountNumber}
                        onChange={(e) => setLoanAccountNumber(e.target.value)}
                        placeholder="Enter loan account number"
                        required
                      />
                    </label>

                    <label className="role-recharge-line-field role-recharge-amount-field">
                      <span>EMI Amount</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(e.target.value)}
                        placeholder="Enter EMI amount"
                        required
                      />
                    </label>

                    <button type="submit" className="role-recharge-primary-btn">Proceed to Pay EMI</button>
                    <p className="role-service-note">Step flow: Select lender → enter loan account number → enter EMI amount → proceed.</p>
                  </form>

                  <section className="role-recharge-operator-panel">
                    <h5>Select Loan Provider</h5>
                    <div className="role-recharge-operator-grid">
                      {filteredRechargeOperators.map((operator) => (
                        <button
                          key={operator.key}
                          type="button"
                          className={`role-recharge-operator-card ${loanProvider === operator.key ? "active" : ""}`}
                          onClick={() => setLoanProvider(operator.key)}
                        >
                          <span
                            className={`role-recharge-operator-logo ${operator.logoClass || ""}`}
                            style={{ backgroundColor: operator.color, color: operator.textColor }}
                          >
                            {operator.mark}
                          </span>
                          <span>{operator.title}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                </>
              ) : (
                <>
                  <form className="role-recharge-first-card" onSubmit={handleRechargeSubmit}>
                    <h5>Recharge or Pay Mobile Bill</h5>

                    <div className="role-recharge-radio-group" role="radiogroup" aria-label="Recharge type">
                      <label>
                        <input
                          type="radio"
                          name="rechargeType"
                          checked={rechargeType === "prepaid"}
                          onChange={() => setRechargeType("prepaid")}
                        />
                        <span>Prepaid</span>
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="rechargeType"
                          checked={rechargeType === "postpaid"}
                          onChange={() => setRechargeType("postpaid")}
                        />
                        <span>Postpaid</span>
                      </label>
                    </div>

                    <label className="role-recharge-line-field">
                      <span>Mobile Number</span>
                      <input
                        value={rechargeMobile}
                        maxLength={10}
                        onChange={(e) => setRechargeMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="Enter 10-digit mobile number"
                        required
                      />
                    </label>

                    <label className="role-recharge-line-field">
                      <span>Circle</span>
                      <select
                        value={rechargeCircle}
                        onChange={(e) => setRechargeCircle(e.target.value)}
                        required
                      >
                        {INDIA_STATES.map((stateName) => (
                          <option key={stateName} value={stateName}>{stateName}</option>
                        ))}
                      </select>
                    </label>

                    <label className="role-recharge-line-field">
                      <span>Operator</span>
                      <input value={rechargeOperator} placeholder="Select operator" readOnly required />
                    </label>

                    <label className="role-recharge-line-field">
                      <span>Search Operator</span>
                      <input
                        value={rechargeOperatorSearch}
                        onChange={(e) => setRechargeOperatorSearch(e.target.value)}
                        placeholder="Search by operator name"
                      />
                    </label>

                    <label className="role-recharge-line-field role-recharge-amount-field">
                      <span>Amount</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={rechargeAmount}
                        onChange={(e) => setRechargeAmount(e.target.value)}
                        placeholder="Enter amount"
                        required
                      />
                      <button
                        type="button"
                        className="role-recharge-link"
                        onClick={() => {
                          const selected = RECHARGE_OPERATORS.find((op) => op.key === rechargeOperator);
                          toast.info(`Browse plans for ${selected?.key || "all operators"}`);
                        }}
                      >
                        Browse Plans
                      </button>
                    </label>

                    <div className="role-recharge-quick-amounts" role="group" aria-label="Quick recharge amounts">
                      {RECHARGE_QUICK_AMOUNTS.map((amount) => (
                        <button
                          key={`mobile-quick-${amount}`}
                          type="button"
                          className={`role-recharge-quick-chip ${String(rechargeAmount) === String(amount) ? "active" : ""}`}
                          onClick={() => setRechargeAmount(String(amount))}
                        >
                          ₹{amount}
                        </button>
                      ))}
                    </div>

                    <button type="submit" className="role-recharge-primary-btn">Proceed to Recharge</button>
                  </form>

                  <section className="role-recharge-operator-panel">
                    <h5>Select an Operator</h5>
                    <div className="role-recharge-operator-grid">
                      {filteredRechargeOperators.map((operator) => (
                        <button
                          key={operator.key}
                          type="button"
                          className={`role-recharge-operator-card ${rechargeOperator === operator.key ? "active" : ""}`}
                          onClick={() => setRechargeOperator(operator.key)}
                        >
                          <span
                            className={`role-recharge-operator-logo ${operator.logoClass}`}
                            style={{ backgroundColor: operator.color, color: operator.textColor }}
                          >
                            {operator.mark}
                          </span>
                          <span>{operator.title}</span>
                        </button>
                      ))}
                    </div>

                    <div className="role-recharge-plan-grid">
                      {selectedMobilePlanSuggestions.map((plan) => (
                        <button
                          key={`${rechargeOperator || "popular"}-${plan.amount}-${plan.validity}`}
                          type="button"
                          className="role-recharge-plan-card"
                          onClick={() => setRechargeAmount(String(plan.amount))}
                        >
                          <strong>₹{plan.amount}</strong>
                          <small>{plan.validity}</small>
                          <span>{plan.benefits}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                </>
              )}
            </div>
          </section>
        )}

        {activeSection === "profile" && (
          <>
            <section className="role-panel">
              <h4>Profile</h4>
              <table className="role-table">
                <tbody>
                  <tr><th>Name</th><td>{profile?.name || user?.name || "-"}</td></tr>
                  <tr><th>Email</th><td>{profile?.email || user?.email || "-"}</td></tr>
                  <tr><th>Role</th><td className="text-capitalize">{role}</td></tr>
                  <tr><th>Phone</th><td>{profile?.phone || "-"}</td></tr>
                  <tr><th>Date Of Birth</th><td>{profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : "-"}</td></tr>
                  <tr><th>Status</th><td>{profile?.is_active ? "Active" : "Inactive"}</td></tr>
                  <tr><th>Total Wallet Balance</th><td>{formatCurrency(totalWalletBalance)}</td></tr>
                </tbody>
              </table>
            </section>
            {role === "retailer" && (
              <section className="role-content-grid">
                <article className="role-panel">
                  <h4>Update Profile</h4>
                  <form className="role-form" onSubmit={handleRetailerProfileSave}>
                    <input value={profileForm.name} placeholder="Name" onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))} required />
                    <input value={profileForm.phone} placeholder="Phone" onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))} />
                    <input type="date" value={profileForm.date_of_birth} onChange={(e) => setProfileForm((p) => ({ ...p, date_of_birth: e.target.value }))} />
                    <button type="submit">Save Profile</button>
                  </form>
                </article>
                <article className="role-panel">
                  <h4>Change Password</h4>
                  <form className="role-form" onSubmit={handleRetailerPasswordChange}>
                    <input type="password" placeholder="Current Password" value={passwordForm.current_password} onChange={(e) => setPasswordForm((p) => ({ ...p, current_password: e.target.value }))} required />
                    <input type="password" placeholder="New Password" value={passwordForm.new_password} onChange={(e) => setPasswordForm((p) => ({ ...p, new_password: e.target.value }))} required />
                    <input type="password" placeholder="Confirm New Password" value={passwordForm.new_password_confirmation} onChange={(e) => setPasswordForm((p) => ({ ...p, new_password_confirmation: e.target.value }))} required />
                    <button type="submit">Change Password</button>
                  </form>
                </article>
                <article className="role-panel">
                  <h4>Bank Details</h4>
                  <form className="role-form" onSubmit={handleRetailerBankSave}>
                    <input value={bankForm.bank_account_name} placeholder="Account Holder Name" onChange={(e) => setBankForm((p) => ({ ...p, bank_account_name: e.target.value }))} required />
                    <input value={bankForm.bank_account_number} placeholder="Account Number" onChange={(e) => setBankForm((p) => ({ ...p, bank_account_number: e.target.value }))} required />
                    <input value={bankForm.bank_ifsc_code} placeholder="IFSC Code" onChange={(e) => setBankForm((p) => ({ ...p, bank_ifsc_code: e.target.value }))} required />
                    <input value={bankForm.bank_name} placeholder="Bank Name" onChange={(e) => setBankForm((p) => ({ ...p, bank_name: e.target.value }))} />
                    <button type="submit">Save Bank Details</button>
                  </form>
                </article>
                <article className="role-panel">
                  <h4>Upload KYC</h4>
                  <form className="role-form" onSubmit={handleRetailerKycUpload}>
                    <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setKycFile(e.target.files?.[0] || null)} required />
                    <button type="submit">Upload KYC</button>
                  </form>
                  <p className="muted">Current KYC Status: {profile?.kyc_status || "pending"}</p>
                </article>
              </section>
            )}
          </>
        )}

        {role === "retailer" && activeSection === "notifications" && (
          <section className="role-panel">
            <h4>Notification Center</h4>
            <table className="role-table">
              <thead><tr><th>Date</th><th>Type</th><th>Message</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {retailerNotifications.map((item) => (
                  <tr key={item.id}>
                    <td>{new Date(item.created_at).toLocaleString()}</td>
                    <td>{item.title}</td>
                    <td>{item.message}</td>
                    <td>{item.is_read ? "Read" : "Unread"}</td>
                    <td>{item.is_read ? "-" : <button type="button" onClick={() => markNotificationRead(item.id)}>Mark Read</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>

      <DepositModal
        show={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onSuccess={() => loadData(role)}
      />
      <WithdrawModal
        show={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onSuccess={() => loadData(role)}
        userRole={role}
      />
    </div>
  );
};

export default RoleDashboard;
