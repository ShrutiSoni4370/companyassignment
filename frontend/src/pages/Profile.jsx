import axios from "axios";
import { useContext, useMemo, useState, useEffect } from "react"; // ✅ FIXED
import { UserContext } from "../context/UserContext";

const API_BASE = "https://companyassignment-ycfz.onrender.com";



function pickArray(payload, keys = []) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
    if (Array.isArray(payload?.data?.[key])) return payload.data[key];
  }
  return [];
}

function pickObject(payload, keys = []) {
  if (payload?.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
    return payload.data;
  }
  for (const key of keys) {
    if (payload?.[key] && typeof payload[key] === "object" && !Array.isArray(payload[key])) {
      return payload[key];
    }
    if (
      payload?.data?.[key] &&
      typeof payload.data[key] === "object" &&
      !Array.isArray(payload.data[key])
    ) {
      return payload.data[key];
    }
  }
  if (payload && typeof payload === "object" && !Array.isArray(payload)) return payload;
  return null;
}

export default function Profile() {
  const { user } = useContext(UserContext);
  const userId = user?._id || user?.id;
  const token = user?.token;

  const api = useMemo(
    () =>
      axios.create({
        baseURL: API_BASE,
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }),
    [token]
  );

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [plans, setPlans] = useState([]);
  const [charities, setCharities] = useState([]);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    selectedSubscriptionId: "",
    selectedCharityId: "",
    contributionPercentage: 10,
    scores: [],
    winnings: [],
    drawsEntered: 0,
    upcomingDrawDate: "",
    subscriptionStatus: "Inactive",
    renewalDate: "",
  });

  const [scoreForm, setScoreForm] = useState({
    stableford: "",
    date: "",
    course: "",
  });

  const formatDate = (date) => {
    if (!date) return "--";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "--";
    return parsed.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (value) => Number(value || 0).toFixed(2);

  const selectedPlan = useMemo(() => {
    return plans.find(
      (item) =>
        String(item._id || item.id) === String(profile.selectedSubscriptionId)
    );
  }, [plans, profile.selectedSubscriptionId]);

  const selectedCharity = useMemo(() => {
    return charities.find(
      (item) =>
        String(item._id || item.id) === String(profile.selectedCharityId)
    );
  }, [charities, profile.selectedCharityId]);

  // Updated logic:
  // If user has any selected subscription, treat as active for UI
  const hasSubscription = !!profile.selectedSubscriptionId;
  const hasActiveSubscription = !!profile.selectedSubscriptionId;
  const hasSelectedCharity = !!profile.selectedCharityId;
  const canParticipate = !!profile.selectedSubscriptionId;

  const averageScore = useMemo(() => {
    if (!profile.scores.length) return "0.0";
    const total = profile.scores.reduce(
      (sum, item) => sum + Number(item?.stableford || 0),
      0
    );
    return (total / profile.scores.length).toFixed(1);
  }, [profile.scores]);

  const totalWon = useMemo(() => {
    return profile.winnings.reduce(
      (sum, item) => sum + Number(item?.amount || 0),
      0
    );
  }, [profile.winnings]);

  const fetchProfileData = async () => {
    if (!userId) {
      setError("No valid user found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const [plansRes, charitiesRes, userRes] = await Promise.all([
        api.get("/subscriptions"),
        api.get("/charities"),
        api.get(`/users/${userId}`),
      ]);

      const plansData = pickArray(plansRes.data, ["plans", "subscriptions", "subscriptionPlans"]);
      const charitiesData = pickArray(charitiesRes.data, ["charities"]);
      const userData = pickObject(userRes.data, ["user"]) || {};

      setPlans(plansData);
      setCharities(charitiesData);

      const normalizedScores = Array.isArray(userData?.scores)
        ? [...userData.scores]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5)
        : [];

      const selectedSubscriptionId =
        userData?.subscription?.selectedSubscriptionId?._id ||
        userData?.subscription?.selectedSubscriptionId ||
        userData?.subscriptionPlan?._id ||
        userData?.subscriptionPlan ||
        "";

      setProfile({
        name: userData?.name || user?.name || "",
        email: userData?.email || user?.email || "",
        phone: userData?.phone || "",
        selectedSubscriptionId,
        selectedCharityId:
          userData?.charity?.charityId?._id ||
          userData?.charity?.charityId ||
          userData?.selectedCharityId ||
          "",
        contributionPercentage: Number(
          userData?.charity?.contributionPercentage ??
            userData?.contributionPercentage ??
            10
        ),
        scores: normalizedScores,
        winnings: Array.isArray(userData?.winnings) ? userData.winnings : [],
        drawsEntered: Number(userData?.drawsEntered || 0),
        upcomingDrawDate: userData?.upcomingDrawDate || "",
        subscriptionStatus: selectedSubscriptionId
          ? "Active"
          : userData?.subscription?.status || userData?.subscriptionStatus || "Inactive",
        renewalDate:
          userData?.subscription?.renewalDate || userData?.renewalDate || "",
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to load profile data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [userId, token]);

  const handleProfileField = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!userId) {
      setError("User not found. Please login again.");
      return;
    }

    try {
      setSavingProfile(true);
      setError("");
      setSuccess("");

      const payload = {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
      };

      await api.put(`/auth/users/${userId}`, payload);
      setSuccess("Profile updated successfully.");
      await fetchProfileData();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to save profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSubscribe = async () => {
    if (!profile.selectedSubscriptionId) {
      setError("Please select a subscription plan first.");
      return;
    }

    try {
      setSavingProfile(true);
      setError("");
      setSuccess("");

      const response = await api.post("/auth/select-subscription", {
        subscriptionId: profile.selectedSubscriptionId,
      });

      setProfile((prev) => ({
        ...prev,
        subscriptionStatus: "Active",
        renewalDate:
          prev.renewalDate ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }));

      setSuccess("Subscription activated successfully. You can now add scores.");

      const url = response?.data?.url;
      if (url) {
        window.open(url, "_blank");
      }

      setTimeout(() => {
        fetchProfileData();
      }, 1500);
    } catch (err) {
      console.error("Subscribe error:", err);
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to create subscription."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdateCharity = async () => {
    if (!hasSubscription) {
      setError("You need a subscription before selecting a charity.");
      return;
    }

    if (!profile.selectedCharityId) {
      setError("Please select a charity.");
      return;
    }

    if (Number(profile.contributionPercentage) < 10) {
      setError("Contribution percentage must be at least 10%.");
      return;
    }

    try {
      setSavingProfile(true);
      setError("");
      setSuccess("");

      await api.post("/auth/select-charity", {
        charityId: profile.selectedCharityId,
        contributionPercentage: Number(profile.contributionPercentage),
      });

      setSuccess("Charity updated successfully.");
      await fetchProfileData();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to update charity."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddScore = async () => {
    if (!profile.selectedSubscriptionId) {
      setError("You need a subscription before adding scores.");
      return;
    }

    try {
      const stableford = Number(scoreForm.stableford);

      if (!stableford || stableford < 1 || stableford > 45) {
        setError("Stableford score must be between 1 and 45.");
        return;
      }

      if (!scoreForm.date) {
        setError("Please select a score date.");
        return;
      }

      setError("");
      setSuccess("");

      const response = await api.post("auth/scores", {
        stableford,
        date: scoreForm.date,
        course: scoreForm.course,
      });

      const updatedScores = pickArray(response.data, ["scores"]);
      setProfile((prev) => ({
        ...prev,
        scores: Array.isArray(updatedScores) ? updatedScores : prev.scores,
      }));
      setScoreForm({ stableford: "", date: "", course: "" });
      setSuccess("Score added successfully.");
      await fetchProfileData();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to save score."
      );
    }
  };

  const handleDeleteScore = async (scoreId) => {
    try {
      setError("");
      setSuccess("");

      const response = await api.delete(`auth/scores/${scoreId}`);
      const updatedScores = pickArray(response.data, ["scores"]);

      setProfile((prev) => ({
        ...prev,
        scores: Array.isArray(updatedScores) ? updatedScores : prev.scores,
      }));
      setSuccess("Score deleted successfully.");
      await fetchProfileData();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to delete score."
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Please login first.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Profile</h1>
          <button
            onClick={handleLogout}
            className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {loading && (
          <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm font-medium text-blue-700">
            Loading profile...
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
            {success}
          </div>
        )}

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Personal Info</h2>
          <div className="mt-5 grid gap-4">
            <input
              type="text"
              placeholder="Full name"
              value={profile.name}
              onChange={(e) => handleProfileField("name", e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
            />
            <input
              type="email"
              placeholder="Email"
              value={profile.email}
              onChange={(e) => handleProfileField("email", e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              placeholder="Phone"
              value={profile.phone}
              onChange={(e) => handleProfileField("phone", e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="w-full rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {savingProfile ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Subscription</h2>
          <p className="mt-2 text-sm text-slate-600">
            After successful selection, scores unlock on this page.
          </p>

          <div className="mt-5 grid gap-3">
            {plans.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">
                No subscription data loaded.
              </div>
            ) : (
              plans.map((plan) => {
                const planId = plan._id || plan.id;
                const active =
                  String(profile.selectedSubscriptionId) === String(planId);

                return (
                  <label
                    key={planId}
                    className={`cursor-pointer rounded-2xl border p-4 transition ${
                      active
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold text-slate-900">{plan.name}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {plan.description || "Subscription plan"}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-emerald-700">
                          £{formatCurrency(plan.amount || plan.price)}
                        </p>
                      </div>
                      <input
                        type="radio"
                        name="subscription"
                        checked={active}
                        onChange={() =>
                          handleProfileField("selectedSubscriptionId", planId)
                        }
                      />
                    </div>
                  </label>
                );
              })
            )}
          </div>

          <button
            onClick={handleSubscribe}
            disabled={!profile.selectedSubscriptionId || savingProfile}
            className="mt-4 w-full rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingProfile ? "Processing..." : "Subscribe Now"}
          </button>

          <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm">
            <p>
              <span className="text-slate-500">Selected Plan:</span>{" "}
              <span className="font-semibold text-slate-900">
                {selectedPlan?.name || "None"}
              </span>
            </p>
            <p className="mt-1">
              <span className="text-slate-500">Status:</span>{" "}
              <span
                className={`font-semibold ${
                  hasActiveSubscription ? "text-emerald-700" : "text-amber-700"
                }`}
              >
                {hasSubscription ? "Active" : profile.subscriptionStatus}
              </span>
            </p>
            <p className="mt-1">
              <span className="text-slate-500">Renewal Date:</span>{" "}
              <span className="font-semibold text-slate-900">
                {formatDate(profile.renewalDate)}
              </span>
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Charity</h2>

          {!profile.selectedSubscriptionId && (
            <p className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Select a subscription first to unlock charity selection.
            </p>
          )}

          <div className={`mt-5 ${!hasSubscription ? "pointer-events-none opacity-50" : ""}`}>
            <select
              value={profile.selectedCharityId}
              onChange={(e) => handleProfileField("selectedCharityId", e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
              disabled={!hasSubscription}
            >
              <option value="">Select charity</option>
              {charities.map((charity) => {
                const charityId = charity._id || charity.id;
                return (
                  <option key={charityId} value={charityId}>
                    {charity.name}
                  </option>
                );
              })}
            </select>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Contribution Percentage (%)
              </label>
              <input
                type="number"
                min="10"
                max="100"
                value={profile.contributionPercentage}
                onChange={(e) =>
                  handleProfileField("contributionPercentage", e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
                disabled={!hasSubscription}
              />
              <p className="mt-2 text-sm text-slate-500">
                Estimated monthly impact:{" "}
                <span className="font-semibold text-emerald-700">
                  £
                  {formatCurrency(
                    (selectedPlan?.amount || selectedPlan?.price || 0) *
                      (Number(profile.contributionPercentage || 0) / 100)
                  )}
                </span>
              </p>
            </div>

            <button
              onClick={handleUpdateCharity}
              disabled={!hasSubscription || !profile.selectedCharityId || savingProfile}
              className="mt-4 w-full rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingProfile ? "Updating..." : "Update Charity"}
            </button>
          </div>

          <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm">
            <p>
              <span className="text-slate-500">Selected Charity:</span>{" "}
              <span className="font-semibold text-slate-900">
                {selectedCharity?.name || "None"}
              </span>
            </p>
            <p className="mt-1">
              <span className="text-slate-500">Contribution:</span>{" "}
              <span className="font-semibold text-slate-900">
                {profile.contributionPercentage || 10}%
              </span>
            </p>
          </div>

          {selectedCharity && (
            <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
              <p className="font-bold text-slate-900">{selectedCharity.name}</p>
              <p className="mt-2 text-sm text-slate-600">
                {selectedCharity.description || "No description available."}
              </p>
            </div>
          )}
        </section>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Scores</h2>
              <p className="mt-1 text-sm text-slate-500">
                Last 5 only, newest first
              </p>
            </div>
            <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              Avg: {averageScore}
            </div>
          </div>

          {!canParticipate && (
            <p className="mb-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Take one subscription to start adding scores.
            </p>
          )}

          <div className={`grid gap-4 ${!canParticipate ? "pointer-events-none opacity-50" : ""}`}>
            <input
              type="number"
              min="1"
              max="45"
              placeholder="Stableford score"
              value={scoreForm.stableford}
              onChange={(e) =>
                setScoreForm((prev) => ({ ...prev, stableford: e.target.value }))
              }
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 disabled:opacity-50"
              disabled={!canParticipate}
            />
            <input
              type="date"
              value={scoreForm.date}
              onChange={(e) =>
                setScoreForm((prev) => ({ ...prev, date: e.target.value }))
              }
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 disabled:opacity-50"
              disabled={!canParticipate}
            />
            <input
              type="text"
              placeholder="Course name"
              value={scoreForm.course}
              onChange={(e) =>
                setScoreForm((prev) => ({ ...prev, course: e.target.value }))
              }
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 disabled:opacity-50"
              disabled={!canParticipate}
            />
            <button
              onClick={handleAddScore}
              disabled={!canParticipate}
              className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Add Score
            </button>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid grid-cols-4 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
              <span>Date</span>
              <span>Course</span>
              <span>Score</span>
              <span>Action</span>
            </div>

            {profile.scores.length === 0 ? (
              <div className="px-4 py-6 text-sm text-slate-500">
                No scores added yet.
              </div>
            ) : (
              profile.scores.map((item) => (
                <div
                  key={item._id || item.id}
                  className="grid grid-cols-4 items-center border-t border-slate-100 px-4 py-3 text-sm"
                >
                  <span>{formatDate(item.date)}</span>
                  <span>{item.course || "N/A"}</span>
                  <span className="font-semibold">{item.stableford}</span>
                  <button
                    onClick={() => handleDeleteScore(item._id || item.id)}
                    className="font-semibold text-red-600 transition hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Participation & Winnings</h2>

          <div
            className={`mt-2 rounded-2xl p-4 ${
              profile.winnings.length > 0
                ? "border border-emerald-200 bg-emerald-50"
                : canParticipate
                ? "border border-blue-200 bg-blue-50"
                : "border border-amber-200 bg-amber-50"
            }`}
          >
            <p className="text-sm font-semibold">
              {profile.winnings.length > 0
                ? "🎉 Congratulations! You won a draw!"
                : canParticipate
                ? "✅ Eligible for upcoming draws"
                : "⚠️ Take a subscription to participate"}
            </p>
            {profile.winnings.length > 0 && (
              <p className="mt-1 text-xs text-emerald-700">
                Latest win: £{formatCurrency(profile.winnings[0]?.amount || 0)}
              </p>
            )}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Draws Entered</p>
              <p className="mt-1 font-semibold text-slate-900">
                {profile.drawsEntered || 0}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Next Draw Date</p>
              <p className="mt-1 font-semibold text-slate-900">
                {formatDate(profile.upcomingDrawDate)}
              </p>
            </div>

            <div
              className={`rounded-2xl p-4 ${
                profile.winnings.length > 0
                  ? "border-2 border-emerald-200 bg-emerald-50"
                  : "bg-emerald-50/50"
              }`}
            >
              <p className="text-sm text-slate-500">Total Won</p>
              <p className="mt-1 text-2xl font-bold text-emerald-700">
                £{formatCurrency(totalWon)}
              </p>
              {profile.winnings.length === 0 && (
                <p className="mt-1 text-xs text-slate-500">No winnings yet</p>
              )}
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Latest Status</p>
              <p
                className={`mt-1 font-semibold ${
                  profile.winnings[0]?.paymentStatus === "paid"
                    ? "text-emerald-700"
                    : profile.winnings[0]?.paymentStatus === "pending"
                    ? "text-amber-700"
                    : "text-slate-700"
                }`}
              >
                {profile.winnings[0]?.paymentStatus === "paid"
                  ? "💰 Paid"
                  : profile.winnings[0]?.paymentStatus === "pending"
                  ? "⏳ Pending"
                  : "No winnings yet"}
              </p>
            </div>
          </div>

          {profile.winnings.length > 0 && (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
              <p className="text-sm font-semibold text-emerald-800">
                Latest Win Details
              </p>
              <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Amount:</span>
                  <p className="font-bold text-emerald-700">
                    £{formatCurrency(profile.winnings[0]?.amount)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-600">Date:</span>
                  <p className="font-semibold">
                    {formatDate(profile.winnings[0]?.createdAt)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-600">Status:</span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-bold ${
                      profile.winnings[0]?.paymentStatus === "paid"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {profile.winnings[0]?.paymentStatus?.toUpperCase() || "PENDING"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
