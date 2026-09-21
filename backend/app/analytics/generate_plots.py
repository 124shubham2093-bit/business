"""
EDA Plot Generation Utility for Startup Failure Intelligence Platform.
Generates focused, high-resolution diagnostic charts from startup_ml_ready.csv.
"""

from pathlib import Path
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np


def generate_eda_plots(
    data_path: str = "data/startup_ml_ready.csv",
    output_dir: str = "data/eda_plots",
) -> list:
    plots_dir = Path(output_dir)
    plots_dir.mkdir(parents=True, exist_ok=True)

    df = pd.read_csv(data_path)
    sns.set_theme(style="whitegrid", palette="muted")
    generated = []

    # 1. Outcome Distribution
    fig, ax = plt.subplots(figsize=(6, 4))
    counts = df["is_failed"].value_counts()
    labels = ["Acquired / Success (0)", "Closed / Failed (1)"]
    colors = ["#2ecc71", "#e74c3c"]
    bars = ax.bar(labels, [counts[0], counts[1]], color=colors, width=0.5, edgecolor="black")
    for bar in bars:
        yval = bar.get_height()
        pct = (yval / len(df)) * 100
        ax.text(
            bar.get_x() + bar.get_width() / 2.0,
            yval + 10,
            f"{yval} ({pct:.1f}%)",
            ha="center",
            va="bottom",
            fontweight="bold",
        )
    ax.set_title("Startup Outcome Distribution in Dataset (N=922)", fontsize=12, fontweight="bold")
    ax.set_ylabel("Number of Startups")
    ax.set_ylim(0, 700)
    plt.tight_layout()
    p1 = plots_dir / "outcome_distribution.png"
    plt.savefig(p1, dpi=150)
    plt.close()
    generated.append(p1)

    # 2. Failure Rate by Category (Top Categories)
    fig, ax = plt.subplots(figsize=(10, 5))
    cat_agg = (
        df.groupby("category_code")
        .agg(total=("is_failed", "count"), failure_rate=("is_failed", "mean"))
        .query("total >= 10")
        .sort_values("failure_rate", ascending=True)
    )

    y_pos = np.arange(len(cat_agg))
    ax.barh(y_pos, cat_agg["failure_rate"] * 100, color="#3498db", edgecolor="black")
    ax.set_yticks(y_pos)
    ax.set_yticklabels(cat_agg.index)
    ax.set_xlabel("Failure Rate (%)")
    ax.set_title("Startup Failure Rate by Industry Sector (Min. 10 Startups)", fontsize=12, fontweight="bold")
    for i, v in enumerate(cat_agg["failure_rate"] * 100):
        total_n = cat_agg["total"].iloc[i]
        ax.text(v + 1, i, f"{v:.1f}% (n={total_n})", va="center", fontsize=9)
    ax.set_xlim(0, 100)
    plt.tight_layout()
    p2 = plots_dir / "failure_rate_by_category.png"
    plt.savefig(p2, dpi=150)
    plt.close()
    generated.append(p2)

    # 3. Failure Rate by Funding Rounds & Stages
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))
    rounds_agg = df.groupby("funding_rounds")["is_failed"].agg(["count", "mean"])
    ax1.plot(rounds_agg.index, rounds_agg["mean"] * 100, marker="o", color="#e67e22", linewidth=2)
    ax1.set_title("Failure Rate by Total Funding Rounds", fontweight="bold")
    ax1.set_xlabel("Number of Funding Rounds")
    ax1.set_ylabel("Failure Rate (%)")
    ax1.set_ylim(0, 70)

    stage_names = ["Round A", "Round B", "Round C", "Round D"]
    has_stage_cols = ["has_roundA", "has_roundB", "has_roundC", "has_roundD"]
    stage_failure_rates = [df[df[c] == 1]["is_failed"].mean() * 100 for c in has_stage_cols]
    stage_counts = [df[c].sum() for c in has_stage_cols]
    bars2 = ax2.bar(stage_names, stage_failure_rates, color="#9b59b6", edgecolor="black", width=0.5)
    for bar, n in zip(bars2, stage_counts):
        yval = bar.get_height()
        ax2.text(bar.get_x() + bar.get_width() / 2.0, yval + 1, f"{yval:.1f}%\n(n={n})", ha="center", va="bottom", fontsize=9)
    ax2.set_title("Failure Rate Among Startups Reaching Stage", fontweight="bold")
    ax2.set_ylabel("Failure Rate (%)")
    ax2.set_ylim(0, 50)
    plt.tight_layout()
    p3 = plots_dir / "failure_rate_by_funding_stage.png"
    plt.savefig(p3, dpi=150)
    plt.close()
    generated.append(p3)

    # 4. Relationships & Milestones by Outcome
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4))
    sns.boxplot(x="is_failed", y="relationships", data=df, ax=ax1, hue="is_failed", palette=["#2ecc71", "#e74c3c"], showfliers=False, legend=False)
    ax1.set_xticks([0, 1])
    ax1.set_xticklabels(["Acquired (0)", "Closed (1)"])
    ax1.set_title("Network Relationships by Outcome", fontweight="bold")
    ax1.set_ylabel("Number of Relationships")

    sns.boxplot(x="is_failed", y="milestones", data=df, ax=ax2, hue="is_failed", palette=["#2ecc71", "#e74c3c"], showfliers=False, legend=False)
    ax2.set_xticks([0, 1])
    ax2.set_xticklabels(["Acquired (0)", "Closed (1)"])
    ax2.set_title("Milestones Achieved by Outcome", fontweight="bold")
    ax2.set_ylabel("Total Milestones")
    plt.tight_layout()
    p4 = plots_dir / "relationships_milestones_by_outcome.png"
    plt.savefig(p4, dpi=150)
    plt.close()
    generated.append(p4)

    # 5. Correlation Heatmap
    fig, ax = plt.subplots(figsize=(10, 8))
    key_features = [
        "is_failed", "relationships", "milestones", "funding_rounds",
        "funding_total_usd", "funding_duration_years", "funding_stages_count",
        "has_milestone", "milestone_duration_years", "is_top500",
        "avg_participants", "has_roundA", "has_roundB", "is_otherstate"
    ]
    corr_sub = df[key_features].corr()
    sns.heatmap(corr_sub, annot=True, fmt=".2f", cmap="coolwarm", vmin=-0.4, vmax=0.4, ax=ax, cbar_kws={"label": "Pearson Correlation"})
    ax.set_title("Correlation Matrix of Key Predictive Features & Startup Failure", fontsize=12, fontweight="bold")
    plt.tight_layout()
    p5 = plots_dir / "correlation_heatmap.png"
    plt.savefig(p5, dpi=150)
    plt.close()
    generated.append(p5)

    return generated


if __name__ == "__main__":
    paths = generate_eda_plots()
    for p in paths:
        print(f"Generated plot: {p}")
