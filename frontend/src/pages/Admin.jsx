import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const initialDashboard = {
    admin: {
        name: "Admin Control",
        role: "Platform Administrator",
        id: "ADM-9001",
    },
    stats: [
        { label: "Total Users", value: 0, tone: "default" },
        { label: "Active Subscribers", value: 0, tone: "success" },
        { label: "Charities Supported", value: 0, tone: "default" },
        { label: "Pending Verifications", value: 0, tone: "warning" },
    ],
    subscriptions: [],
    draws: {
        month: "March 2026",
        pool: "£0",
        participants: 0,
        status: "Ready to run",
        tiers: [
            { match: "5-Number Match", share: "40%", winners: 0 },
            { match: "4-Number Match", share: "35%", winners: 0 },
            { match: "3-Number Match", share: "25%", winners: 0 },
        ],
    },
    charities: [],
    users: [],
    verifications: [
      
    ],
    quickActions: [
        { label: "Add Charity", action: "add-charity", primary: false },
        { label: "Add Subscription", action: "add-subscription", primary: true },
        { label: "Run Draw", action: "run-draw", primary: false },
    ],
};

const emptyUserForm = {
    name: "",
    email: "",
    role: "user",
    isActive: true,
};

const emptyCharityForm = {
    name: "",
    membersCount: "",
    totalRaised: "",
};

const emptySubscriptionForm = {
    name: "",
    planType: "Monthly",
    amount: "",
    status: "Active",
};

export default function Admin() {
    const navigate = useNavigate();
    const API_BASE = "https://companyassignment-ycfz.onrender.com";

    const [dashboard, setDashboard] = useState(initialDashboard);
    const [loading, setLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [showUserDialog, setShowUserDialog] = useState(false);
    const [showCharityDialog, setShowCharityDialog] = useState(false);
    const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
    const [showUserDetailsDialog, setShowUserDetailsDialog] = useState(false);

    const [editingUserId, setEditingUserId] = useState(null);
    const [editingCharityId, setEditingCharityId] = useState(null);
    const [editingSubscriptionId, setEditingSubscriptionId] = useState(null);

    const [userForm, setUserForm] = useState(emptyUserForm);
    const [charityForm, setCharityForm] = useState(emptyCharityForm);
    const [subscriptionForm, setSubscriptionForm] = useState(emptySubscriptionForm);
    const [selectedUserDetails, setSelectedUserDetails] = useState(null);

    const totalRaised = useMemo(() => {
        return dashboard.charities.reduce((sum, item) => {
            return sum + Number(item.totalRaised || item.amount || 0);
        }, 0);
    }, [dashboard.charities]);

    const activeSubscribers = useMemo(() => {
        return dashboard.subscriptions.filter((item) => item.status === "Active").length;
    }, [dashboard.subscriptions]);

    const pendingVerifications = useMemo(() => {
        return dashboard.verifications.filter((item) => item.status === "Pending").length;
    }, [dashboard.verifications]);

    const eligibleDrawUsers = useMemo(() => {
        return dashboard.users.filter((user) => {
            const hasSubscriptions =
                Array.isArray(user.subscriptions) && user.subscriptions.length > 0;

            const hasSelectedSubscription =
                user?.subscription?.selectedSubscriptionId ||
                user?.selectedSubscriptionId ||
                user?.subscriptionId;

            const hasSubscriptionStatus =
                user?.subscription?.status === "Active" || user?.subscription?.status === "Pending";

            return hasSubscriptions || hasSelectedSubscription || hasSubscriptionStatus;
        });
    }, [dashboard.users]);

    const statusBadge = (status) => {
        if (status === "Active" || status === "Approved") {
            return "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300";
        }
        if (status === "Pending") {
            return "bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300";
        }
        if (status === "Cancelled" || status === "Inactive") {
            return "bg-rose-100 text-rose-800 dark:bg-rose-400/10 dark:text-rose-300";
        }
        return "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200";
    };

    const refreshStats = (users, charities, subscriptions) => {
        setDashboard((prev) => ({
            ...prev,
            stats: [
                { label: "Total Users", value: users.length, tone: "default" },
                {
                    label: "Active Subscribers",
                    value: subscriptions.filter((s) => s.status === "Active").length,
                    tone: "success",
                },
                { label: "Charities Supported", value: charities.length, tone: "default" },
                {
                    label: "Pending Verifications",
                    value: prev.verifications.filter((v) => v.status === "Pending").length,
                    tone: "warning",
                },
            ],
        }));
    };

    const fetchDashboard = async () => {
        try {
            setTableLoading(true);
            setError("");

            const [usersRes, charitiesRes, subscriptionsRes] = await Promise.all([
                axios.get(`${API_BASE}/auth/users`),
                axios.get(`${API_BASE}/auth/charities`),
                axios.get(`${API_BASE}/auth/subscriptions`),
            ]);

            const users = usersRes?.data?.data || [];
            const charities = charitiesRes?.data?.data || [];
            const subscriptions = subscriptionsRes?.data?.data || [];

            setDashboard((prev) => ({
                ...prev,
                users,
                charities,
                subscriptions,
                draws: {
                    ...prev.draws,
                    participants: subscriptions.filter((s) => s.status === "Active").length,
                    pool: `£${subscriptions
                        .filter((s) => s.status === "Active")
                        .reduce((sum, s) => sum + Number(s.amount || 0), 0)
                        .toLocaleString()}`,
                },
            }));

            refreshStats(users, charities, subscriptions);
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Failed to load admin dashboard data");
        } finally {
            setTableLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const closeAllDialogs = () => {
        setShowUserDialog(false);
        setShowCharityDialog(false);
        setShowSubscriptionDialog(false);
        setShowUserDetailsDialog(false);

        setEditingUserId(null);
        setEditingCharityId(null);
        setEditingSubscriptionId(null);

        setUserForm(emptyUserForm);
        setCharityForm(emptyCharityForm);
        setSubscriptionForm(emptySubscriptionForm);
        setSelectedUserDetails(null);
    };

    const handleRunDraw = async () => {
        const ok = window.confirm("Run the monthly draw now?");
        if (!ok) return;

        try {
            setLoading(true);
            setError("");
            setMessage("");

            const res = await axios.post(`${API_BASE}/auth/run`);
            const result = res?.data?.data;

            const winnerName = result?.winner?.name || "Unknown winner";
            const giftAmount = Number(result?.winner?.giftAmount || 0).toLocaleString();
            const charityAmount = Number(result?.winner?.charityAmount || 0).toLocaleString();
            const charityName = result?.winner?.charityName || "No charity linked";

            setMessage(
                `Draw completed successfully. Winner: ${winnerName}. Gift: £${giftAmount}. Charity donation: £${charityAmount} to ${charityName}.`
            );

            setDashboard((prev) => ({
                ...prev,
                draws: {
                    ...prev.draws,
                    status: "Completed",
                },
                verifications: [
                    {
                        winner: winnerName,
                        tier: "Monthly Draw Winner",
                        amount: `£${giftAmount}`,
                        status: "Pending",
                    },
                    ...prev.verifications,
                ],
            }));

            await fetchDashboard();
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Failed to run draw");
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAction = (action) => {
        if (action === "add-user") setShowUserDialog(true);
        if (action === "add-charity") setShowCharityDialog(true);
        if (action === "add-subscription") setShowSubscriptionDialog(true);
        if (action === "run-draw") handleRunDraw();
    };

    const openEditUser = (user) => {
        setEditingUserId(user._id);
        setUserForm({
            name: user.name || "",
            email: user.email || "",
            role: user.role || "user",
            isActive: user.isActive ?? true,
        });
        setShowUserDialog(true);
    };

    const openEditCharity = (charity) => {
        setEditingCharityId(charity._id);
        setCharityForm({
            name: charity.name || "",
            membersCount: charity.membersCount ?? "",
            totalRaised: charity.totalRaised ?? charity.amount ?? "",
        });
        setShowCharityDialog(true);
    };

    const openEditSubscription = (subscription) => {
        setEditingSubscriptionId(subscription._id);
        setSubscriptionForm({
            name: subscription.name || subscription.Name || "",
            planType: subscription.planType || subscription.plan || "Monthly",
            amount: subscription.amount ?? "",
            status: subscription.status || "Active",
        });
        setShowSubscriptionDialog(true);
    };

    const openUserDetails = async (user) => {
        try {
            setLoading(true);
            setError("");
            setMessage("");

            const res = await axios.get(`${API_BASE}/auth/users/${user._id}`);
            const data = res?.data?.data || user;

            setSelectedUserDetails(data);
            setShowUserDetailsDialog(true);
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Failed to load user details");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError("");

            const payload = {
                name: userForm.name,
                email: userForm.email,
                role: userForm.role,
                isActive: userForm.isActive,
            };

            if (editingUserId) {
                await axios.put(`${API_BASE}/auth/users/${editingUserId}`, payload);
                setMessage("User updated successfully!");
            } else {
                await axios.post(`${API_BASE}/auth/users`, payload);
                setMessage("User created successfully!");
            }

            setShowUserDialog(false);
            setUserForm(emptyUserForm);
            setEditingUserId(null);
            await fetchDashboard();
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Failed to save user");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCharity = async (e) => {
        e.preventDefault();

        try {
            setTableLoading(true);
            setError("");

            const payload = {
                name: charityForm.name,
                membersCount: Number(charityForm.membersCount) || 0,
                amount: Number(charityForm.totalRaised) || 0,
            };

            if (editingCharityId) {
                await axios.put(`${API_BASE}/auth/charities/${editingCharityId}`, payload);
                setMessage("Charity updated successfully!");
            } else {
                await axios.post(`${API_BASE}/auth/charities`, payload);
                setMessage("Charity created successfully!");
            }

            setShowCharityDialog(false);
            setCharityForm(emptyCharityForm);
            setEditingCharityId(null);
            await fetchDashboard();
        } catch (error) {
            console.error("Charity error:", error?.response?.data || error.message);
            setError(error?.response?.data?.message || "Failed to save charity");
        } finally {
            setTableLoading(false);
        }
    };

    const handleSaveSubscription = async (e) => {
        e.preventDefault();

        try {
            setTableLoading(true);
            setError("");

            const payload = {
                name: subscriptionForm.name,
                planType: subscriptionForm.planType,
                amount: Number(subscriptionForm.amount) || 0,
                status: subscriptionForm.status,
            };

            if (editingSubscriptionId) {
                await axios.put(`${API_BASE}/auth/subscriptions/${editingSubscriptionId}`, payload);
                setMessage("Subscription updated successfully!");
            } else {
                await axios.post(`${API_BASE}/auth/subscriptions`, payload);
                setMessage("Subscription created successfully!");
            }

            setShowSubscriptionDialog(false);
            setSubscriptionForm(emptySubscriptionForm);
            setEditingSubscriptionId(null);
            await fetchDashboard();
        } catch (error) {
            console.error("Subscription error:", error?.response?.data || error.message);
            setError(error?.response?.data?.message || "Failed to save subscription");
        } finally {
            setTableLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        const ok = window.confirm("Delete this user?");
        if (!ok) return;

        try {
            setLoading(true);
            setError("");
            await axios.delete(`${API_BASE}/auth/users/${id}`);
            setMessage("User deleted successfully!");
            await fetchDashboard();
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Failed to delete user");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCharity = async (id) => {
        const ok = window.confirm("Delete this charity?");
        if (!ok) return;

        try {
            setLoading(true);
            setError("");
            await axios.delete(`${API_BASE}/auth/charities/${id}`);
            setMessage("Charity deleted successfully!");
            await fetchDashboard();
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Failed to delete charity");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSubscription = async (id) => {
        const ok = window.confirm("Delete this subscription?");
        if (!ok) return;

        try {
            setLoading(true);
            setError("");
            await axios.delete(`${API_BASE}/auth/subscriptions/${id}`);
            setMessage("Subscription deleted successfully!");
            await fetchDashboard();
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Failed to delete subscription");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 text-slate-900 dark:bg-[#101513] dark:text-white">
            <main className="mx-auto w-[min(1240px,calc(100%-1.5rem))] py-8 md:w-[min(1240px,calc(100%-2rem))] md:py-12">
                {error && (
                    <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
                        {message}
                    </div>
                )}

                <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 md:p-8">
                        <div className="flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                                    Admin dashboard
                                </p>
                                <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                                    {dashboard.admin.name}
                                </h1>
                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                    {dashboard.admin.role} · {dashboard.admin.id}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300">
                                    Draw status: {dashboard.draws.status}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => navigate("/")}
                                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                                >
                                    Back to Home
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <div className="rounded-3xl border border-slate-200 bg-stone-50 p-4 dark:border-white/10 dark:bg-white/5">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Total Users</p>
                                <p className="mt-2 text-2xl font-semibold tracking-tight">{dashboard.users.length}</p>
                            </div>
                            <div className="rounded-3xl border border-slate-200 bg-stone-50 p-4 dark:border-white/10 dark:bg-white/5">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Active Subscribers</p>
                                <p className="mt-2 text-2xl font-semibold tracking-tight">{activeSubscribers}</p>
                            </div>
                            <div className="rounded-3xl border border-slate-200 bg-stone-50 p-4 dark:border-white/10 dark:bg-white/5">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Charities Supported</p>
                                <p className="mt-2 text-2xl font-semibold tracking-tight">{dashboard.charities.length}</p>
                            </div>
                            <div className="rounded-3xl border border-slate-200 bg-stone-50 p-4 dark:border-white/10 dark:bg-white/5">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Pending Verifications</p>
                                <p className="mt-2 text-2xl font-semibold tracking-tight">{pendingVerifications}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[28px] border border-slate-200 bg-gradient-to-b from-white to-stone-100 p-6 shadow-sm dark:border-white/10 dark:from-white/5 dark:to-white/[0.03] md:p-8">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                            Quick actions
                        </p>
                        <h2 className="mt-3 text-2xl font-semibold tracking-tight">Platform controls</h2>
                        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                            Manage users, charities, subscriptions, run the draw, and update records from one dashboard.
                        </p>

                        <div className="mt-6 grid gap-3">
                            {dashboard.quickActions.map((action) => (
                                <button
                                    key={action.label}
                                    type="button"
                                    onClick={() => handleQuickAction(action.action)}
                                    className={`inline-flex min-h-12 items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                                        action.primary
                                            ? "bg-emerald-700 text-white hover:bg-emerald-800"
                                            : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                                    }`}
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>

                        <div className="mt-6 rounded-[24px] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Total charity raised</p>
                            <p className="mt-2 text-3xl font-semibold tracking-tight">
                                £{totalRaised.toLocaleString()}
                            </p>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                Combined visible total from all loaded charities.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="mt-6 grid gap-6">
                    <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 md:p-8">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                                    Draw eligible users
                                </p>
                                <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                                    Users with subscriptions
                                </h2>
                            </div>
                        </div>

                        <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200 dark:border-white/10">
                            <div className="hidden grid-cols-5 gap-4 bg-stone-100 px-6 py-4 text-sm font-semibold text-slate-800 dark:bg-white/5 dark:text-white md:grid">
                                <span>Name</span>
                                <span>Email</span>
                                <span>Role</span>
                                <span>Status</span>
                                <span>Actions</span>
                            </div>

                            <div className="divide-y divide-slate-200 dark:divide-white/10">
                                {eligibleDrawUsers.map((user) => (
                                    <div key={user._id} className="grid gap-3 px-6 py-5 md:grid-cols-5 md:gap-4">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400 md:hidden">Name</p>
                                            <p className="text-sm text-slate-800 dark:text-white">{user.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400 md:hidden">Email</p>
                                            <p className="text-sm text-slate-800 dark:text-white">{user.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400 md:hidden">Role</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-300">{user.role}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400 md:hidden">Status</p>
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                    user.isActive ? statusBadge("Active") : statusBadge("Inactive")
                                                }`}
                                            >
                                                {user.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => openUserDetails(user)}
                                                className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/10"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {!tableLoading && eligibleDrawUsers.length === 0 && (
                                    <div className="px-6 py-8 text-sm text-slate-500 dark:text-slate-400">
                                        No eligible users found for draw.
                                    </div>
                                )}
                            </div>
                        </div>
                    </article>
                </section>

                <section className="mt-6 grid gap-6">
                    <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 md:p-8">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                                    User management
                                </p>
                                <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                                    Platform users
                                </h2>
                            </div>
                        </div>

                        <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200 dark:border-white/10">
                            <div className="hidden grid-cols-5 gap-4 bg-stone-100 px-6 py-4 text-sm font-semibold text-slate-800 dark:bg-white/5 dark:text-white md:grid">
                                <span>Name</span>
                                <span>Email</span>
                                <span>Role</span>
                                <span>Status</span>
                                <span>Actions</span>
                            </div>

                            <div className="divide-y divide-slate-200 dark:divide-white/10">
                                {dashboard.users.map((user) => (
                                    <div key={user._id} className="grid gap-3 px-6 py-5 md:grid-cols-5 md:gap-4">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400 md:hidden">Name</p>
                                            <p className="text-sm text-slate-800 dark:text-white">{user.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400 md:hidden">Email</p>
                                            <p className="text-sm text-slate-800 dark:text-white">{user.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400 md:hidden">Role</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-300">{user.role}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400 md:hidden">Status</p>
                                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${user.isActive ? statusBadge("Active") : statusBadge("Inactive")}`}>
                                                {user.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => openEditUser(user)}
                                                className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/10"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteUser(user._id)}
                                                className="rounded-full bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {!tableLoading && dashboard.users.length === 0 && (
                                    <div className="px-6 py-8 text-sm text-slate-500 dark:text-slate-400">
                                        No users found.
                                    </div>
                                )}
                            </div>
                        </div>
                    </article>
                </section>

                <section className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                    <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 md:p-8">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                                    Subscription management
                                </p>
                                <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                                    Subscription records
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowSubscriptionDialog(true)}
                                className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
                            >
                                Add Subscription
                            </button>
                        </div>

                        <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200 dark:border-white/10">
                            <div className="hidden grid-cols-5 gap-4 bg-stone-100 px-6 py-4 text-sm font-semibold text-slate-800 dark:bg-white/5 dark:text-white md:grid">
                                <span>Name</span>
                                <span>Amount</span>
                                <span>Status</span>
                                <span>Subscribers</span>
                                <span>Actions</span>
                            </div>

                            <div className="divide-y divide-slate-200 dark:divide-white/10">
                                {dashboard.subscriptions.map((item) => (
                                    <div key={item._id} className="grid gap-3 px-6 py-5 md:grid-cols-5 md:gap-4">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400 md:hidden">Name</p>
                                            <p className="text-sm text-slate-800 dark:text-white">{item.name || "Unnamed Plan"}</p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400 md:hidden">Amount</p>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                £{Number(item.amount || 0).toLocaleString()}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400 md:hidden">Status</p>
                                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(item.status)}`}>
                                                {item.status || "Active"}
                                            </span>
                                        </div>

                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400 md:hidden">Subscribers</p>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-white">
                                                {item.subscribers?.length || 0}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => openEditSubscription(item)}
                                                className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/10"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteSubscription(item._id)}
                                                className="rounded-full bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {!tableLoading && dashboard.subscriptions.length === 0 && (
                                    <div className="px-6 py-8 text-sm text-slate-500 dark:text-slate-400">
                                        No subscription plans found.
                                    </div>
                                )}
                            </div>
                        </div>
                    </article>

                    <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 md:p-8">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                            Draw management
                        </p>
                        <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                            Monthly draw control
                        </h2>

                        <div className="mt-6 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-3xl border border-slate-200 bg-stone-50 p-4 dark:border-white/10 dark:bg-white/5">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Month</p>
                                <p className="mt-1 font-semibold">{dashboard.draws.month}</p>
                            </div>
                            <div className="rounded-3xl border border-slate-200 bg-stone-50 p-4 dark:border-white/10 dark:bg-white/5">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Prize Pool</p>
                                <p className="mt-1 font-semibold">{dashboard.draws.pool}</p>
                            </div>
                            <div className="rounded-3xl border border-slate-200 bg-stone-50 p-4 dark:border-white/10 dark:bg-white/5">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Participants</p>
                                <p className="mt-1 font-semibold">{dashboard.draws.participants}</p>
                            </div>
                        </div>

                        <div className="mt-6 space-y-3">
                            {dashboard.draws.tiers.map((tier) => (
                                <div
                                    key={tier.match}
                                    className="flex flex-col gap-3 rounded-[20px] border border-slate-200 bg-stone-50 p-4 dark:border-white/10 dark:bg-white/5 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white">{tier.match}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Share: {tier.share}
                                        </p>
                                    </div>
                                    <div className="text-sm text-slate-600 dark:text-slate-300">
                                        Winners: <span className="font-semibold text-slate-900 dark:text-white">{tier.winners}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={handleRunDraw}
                            disabled={loading}
                            className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
                        >
                            {loading ? "Running Draw..." : "Run Monthly Draw"}
                        </button>
                    </article>
                </section>

                <section className="mt-6 grid gap-6 xl:grid-cols-2">
                    <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 md:p-8">
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                                    Charity distribution
                                </p>
                                <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                                    Supported charities
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowCharityDialog(true)}
                                className="rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
                            >
                                Add Charity
                            </button>
                        </div>

                        <div className="mt-6 space-y-3">
                            {dashboard.charities.map((charity) => (
                                <div
                                    key={charity._id}
                                    className="grid gap-3 rounded-[20px] border border-slate-200 bg-stone-50 p-4 dark:border-white/10 dark:bg-white/5 sm:grid-cols-[1.3fr_0.7fr_0.7fr_auto]"
                                >
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white">{charity.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Members</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-200">{charity.membersCount ?? 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Raised</p>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                            £{Number(charity.totalRaised || charity.amount || 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openEditCharity(charity)}
                                            className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/10"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteCharity(charity._id)}
                                            className="rounded-full bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {!tableLoading && dashboard.charities.length === 0 && (
                                <div className="rounded-[20px] border border-slate-200 bg-stone-50 p-4 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                                    No charities found.
                                </div>
                            )}
                        </div>
                    </article>

                    <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 md:p-8">
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                                    Winner verification
                                </p>
                                <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                                    Payout approvals
                                </h2>
                            </div>
                        </div>

                        <div className="mt-6 space-y-3">
                            {dashboard.verifications.map((item) => (
                                <div
                                    key={`${item.winner}-${item.tier}`}
                                    className="rounded-[20px] border border-slate-200 bg-stone-50 p-4 dark:border-white/10 dark:bg-white/5"
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white">{item.winner}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {item.tier} · {item.amount}
                                            </p>
                                        </div>
                                        <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate("/admin/verifications")}
                            className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
                        >
                            Verify Winners
                        </button>
                    </article>
                </section>
            </main>

            {showUserDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-xl dark:bg-[#161d1b]">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-semibold tracking-tight">
                                {editingUserId ? "Edit User" : "Create User"}
                            </h3>
                            <button
                                type="button"
                                onClick={closeAllDialogs}
                                className="rounded-full border border-slate-200 px-3 py-1 text-sm dark:border-white/10"
                            >
                                Close
                            </button>
                        </div>

                        <form className="mt-6 space-y-4" onSubmit={handleSaveUser}>
                            <div>
                                <label className="text-sm font-medium">Name</label>
                                <input
                                    type="text"
                                    value={userForm.name}
                                    onChange={(e) => setUserForm((prev) => ({ ...prev, name: e.target.value }))}
                                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none dark:border-white/10 dark:bg-white/5"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Email</label>
                                <input
                                    type="email"
                                    value={userForm.email}
                                    onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))}
                                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none dark:border-white/10 dark:bg-white/5"
                                    required
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="text-sm font-medium">Role</label>
                                    <select
                                        value={userForm.role}
                                        onChange={(e) => setUserForm((prev) => ({ ...prev, role: e.target.value }))}
                                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none dark:border-white/10 dark:bg-white/5"
                                    >
                                        <option value="user">user</option>
                                        <option value="admin">admin</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Status</label>
                                    <select
                                        value={String(userForm.isActive)}
                                        onChange={(e) =>
                                            setUserForm((prev) => ({
                                                ...prev,
                                                isActive: e.target.value === "true",
                                            }))
                                        }
                                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none dark:border-white/10 dark:bg-white/5"
                                    >
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
                            >
                                {loading ? "Saving..." : editingUserId ? "Update User" : "Create User"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showCharityDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-xl dark:bg-[#161d1b]">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-semibold tracking-tight">
                                {editingCharityId ? "Edit Charity" : "Create Charity"}
                            </h3>
                            <button
                                type="button"
                                onClick={closeAllDialogs}
                                className="rounded-full border border-slate-200 px-3 py-1 text-sm dark:border-white/10"
                            >
                                Close
                            </button>
                        </div>

                        <form className="mt-6 space-y-4" onSubmit={handleSaveCharity}>
                            <div>
                                <label className="text-sm font-medium">Charity name</label>
                                <input
                                    type="text"
                                    value={charityForm.name}
                                    onChange={(e) => setCharityForm((prev) => ({ ...prev, name: e.target.value }))}
                                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none dark:border-white/10 dark:bg-white/5"
                                    required
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="text-sm font-medium">Members</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={charityForm.membersCount}
                                        onChange={(e) =>
                                            setCharityForm((prev) => ({ ...prev, membersCount: e.target.value }))
                                        }
                                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none dark:border-white/10 dark:bg-white/5"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Raised amount</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={charityForm.totalRaised}
                                        onChange={(e) =>
                                            setCharityForm((prev) => ({ ...prev, totalRaised: e.target.value }))
                                        }
                                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none dark:border-white/10 dark:bg-white/5"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
                            >
                                {loading ? "Saving..." : editingCharityId ? "Update Charity" : "Create Charity"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showSubscriptionDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-xl dark:bg-[#161d1b]">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-semibold tracking-tight">
                                {editingSubscriptionId ? "Edit Subscription" : "Create Subscription"}
                            </h3>
                            <button
                                type="button"
                                onClick={closeAllDialogs}
                                className="rounded-full border border-slate-200 px-3 py-1 text-sm dark:border-white/10"
                            >
                                Close
                            </button>
                        </div>

                        <form className="mt-6 space-y-4" onSubmit={handleSaveSubscription}>
                            <div>
                                <label className="text-sm font-medium">Name</label>
                                <input
                                    type="text"
                                    value={subscriptionForm.name}
                                    onChange={(e) =>
                                        setSubscriptionForm((prev) => ({ ...prev, name: e.target.value }))
                                    }
                                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none dark:border-white/10 dark:bg-white/5"
                                    required
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="text-sm font-medium">Plan</label>
                                    <select
                                        value={subscriptionForm.planType}
                                        onChange={(e) =>
                                            setSubscriptionForm((prev) => ({ ...prev, planType: e.target.value }))
                                        }
                                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none dark:border-white/10 dark:bg-white/5"
                                    >
                                        <option value="Monthly">Monthly</option>
                                        <option value="Yearly">Yearly</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Amount</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={subscriptionForm.amount}
                                        onChange={(e) =>
                                            setSubscriptionForm((prev) => ({ ...prev, amount: e.target.value }))
                                        }
                                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none dark:border-white/10 dark:bg-white/5"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Status</label>
                                <select
                                    value={subscriptionForm.status}
                                    onChange={(e) =>
                                        setSubscriptionForm((prev) => ({ ...prev, status: e.target.value }))
                                    }
                                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none dark:border-white/10 dark:bg-white/5"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
                            >
                                {loading
                                    ? "Saving..."
                                    : editingSubscriptionId
                                    ? "Update Subscription"
                                    : "Create Subscription"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showUserDetailsDialog && selectedUserDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-xl dark:bg-[#161d1b]">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-semibold tracking-tight">User Draw Details</h3>
                            <button
                                type="button"
                                onClick={closeAllDialogs}
                                className="rounded-full border border-slate-200 px-3 py-1 text-sm dark:border-white/10"
                            >
                                Close
                            </button>
                        </div>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
                                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Name</p>
                                <p className="mt-2 font-semibold">{selectedUserDetails.name || "N/A"}</p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
                                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Email</p>
                                <p className="mt-2 font-semibold">{selectedUserDetails.email || "N/A"}</p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
                                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Subscription</p>
                                <p className="mt-2 font-semibold">
                                    {selectedUserDetails?.subscription?.selectedSubscriptionId?.name ||
                                        selectedUserDetails?.subscription?.name ||
                                        selectedUserDetails?.selectedSubscription?.name ||
                                        "No subscription linked"}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
                                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Subscription Status</p>
                                <p className="mt-2 font-semibold">
                                    {selectedUserDetails?.subscription?.status || "N/A"}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
                                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Charity</p>
                                <p className="mt-2 font-semibold">
                                    {selectedUserDetails?.charity?.charityId?.name ||
                                        selectedUserDetails?.charity?.name ||
                                        "No charity linked"}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
                                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Score</p>
                                <p className="mt-2 font-semibold">
                                    {Array.isArray(selectedUserDetails?.scores)
                                        ? selectedUserDetails.scores.join(", ")
                                        : selectedUserDetails?.score ?? "No score available"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
