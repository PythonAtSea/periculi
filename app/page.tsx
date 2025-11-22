"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Save, Trash, X } from "lucide-react";
import React from "react";

export default function Home() {
  type Risk = {
    name: string;
    description: string;
    likelihood: 1 | 2 | 3 | 4 | 5;
    impact: 1 | 2 | 3 | 4 | 5;
    detectability: 1 | 2 | 3 | 4 | 5;
    score: number;
    mitigation: Risk | null;
    isNew?: boolean;
  };

  const likelihoodLevels = {
    1: "Happens once or twice per season or event.",
    2: "Rare, shows up occasionally in practice or testing.",
    3: "Appears sometimes during matches.",
    4: "Happens in most matches.",
    5: "Happens every match or repeatedly.",
  };

  const impactLevels = {
    1: "No noticeable impact on robot performance.",
    2: "Small performance loss but robot still works normally.",
    3: "Moderate performance loss that reduces scoring.",
    4: "Major failure that severely limits robot function.",
    5: "Match-ending failure or complete robot disablement.",
  };

  const detectabilityLevels = {
    1: "Immediately obvious when it happens.",
    2: "Easy to detect before or during a match.",
    3: "Detectable with checks or telemetry.",
    4: "Hard to detect and happens intermittently.",
    5: "Almost impossible to detect before failure happens.",
  };

  const [risks, setRisks] = React.useState<Risk[]>([]);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = React.useState<
    number | null
  >(null);
  const [sort, setSort] = React.useState("score-desc");

  function calculateRiskScore(
    likelihood: number,
    impact: number,
    detectability: number
  ) {
    return likelihood * impact * detectability;
  }

  function getRiskScoreColor(score: number) {
    if (!Number.isFinite(score)) return "border";

    if (score <= 10) {
      return "border";
    } else if (score <= 40) {
      return "bg-yellow-400 text-black font-semibold border border-yellow-500";
    } else if (score <= 80) {
      return "bg-orange-400 text-black font-bold border border-orange-500";
    } else {
      return "bg-red-600 text-white font-black border border-red-700";
    }
  }

  function getRiskCardClasses(score: number) {
    if (!Number.isFinite(score)) return "border";

    if (score <= 10) {
      return "border border-l-4";
    } else if (score <= 40) {
      return "bg-yellow-950/20 border border-l-4 border-yellow-500";
    } else if (score <= 80) {
      return "bg-orange-950/30 border border-l-4 border-orange-500";
    } else {
      return "bg-red-950/40 border border-l-4 border-red-600";
    }
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-2">
        <Button
          onClick={() => {
            setRisks((prev) => {
              const saved = prev.map((r) =>
                r.isNew
                  ? {
                      ...r,
                      isNew: false,
                      score: calculateRiskScore(
                        r.likelihood,
                        r.impact,
                        r.detectability
                      ),
                    }
                  : r
              );

              return [
                ...saved,
                {
                  name: "",
                  description: "",
                  likelihood: 1,
                  impact: 1,
                  detectability: 1,
                  score: 1,
                  mitigation: null,
                  isNew: true,
                },
              ];
            });
          }}
        >
          Add Risk
          <Plus />
        </Button>
        <Select value={sort} onValueChange={(value) => setSort(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Choose sorting system" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="score-desc">
              Sort by Score (High to Low)
            </SelectItem>
            <SelectItem value="score-asc">
              Sort by Score (Low to High)
            </SelectItem>
            <SelectItem value="name-asc">Sort by Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Sort by Name (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {risks
        .sort((a, b) => {
          if (a.isNew) {
            return -1;
          }
          if (b.isNew) {
            return 1;
          }
          if (sort === "score-asc") {
            return a.score - b.score;
          } else if (sort === "score-desc") {
            return b.score - a.score;
          } else if (sort === "name-asc") {
            return a.name.localeCompare(b.name);
          } else if (sort === "name-desc") {
            return b.name.localeCompare(a.name);
          }
          return 0;
        })
        .map((risk, index) => (
          <div
            key={index}
            className={`p-4 mb-4 flex gap-2 flex-col ${getRiskCardClasses(
              risk.score
            )}`}
          >
            <h2 className="text-lg font-bold mb-2 flex flex-row gap-4">
              <Input
                placeholder="Aliens can abduct the robot during matches"
                value={risk.name}
                className="w-full max-w-md bg-background"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setRisks((prev) =>
                    prev.map((r, i) =>
                      i === index ? { ...r, name: e.target.value } : r
                    )
                  )
                }
              />
              <p
                className={`border w-fit px-2 flex items-center ${getRiskScoreColor(
                  risk.score
                )}`}
              >
                {risk.score}
              </p>
              <div className="ml-auto flex items-center gap-2">
                {risk.isNew ? (
                  <>
                    <Button
                      onClick={() => {
                        setRisks((prev) =>
                          prev.map((r, i) =>
                            i === index
                              ? {
                                  ...r,
                                  isNew: false,
                                  score: calculateRiskScore(
                                    r.likelihood,
                                    r.impact,
                                    r.detectability
                                  ),
                                }
                              : r
                          )
                        );
                      }}
                    >
                      <Save />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setRisks((prev) => prev.filter((_, i) => i !== index))
                      }
                    >
                      <Trash />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (confirmDeleteIndex === index) {
                          setRisks((prev) =>
                            prev.filter((_, i) => i !== index)
                          );
                          setConfirmDeleteIndex(null);
                        } else {
                          setConfirmDeleteIndex(index);
                        }
                      }}
                      aria-pressed={confirmDeleteIndex === index}
                    >
                      <Trash />
                    </Button>

                    {confirmDeleteIndex === index && (
                      <Button
                        variant="outline"
                        onClick={() => setConfirmDeleteIndex(null)}
                      >
                        <X />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </h2>
            <Textarea
              placeholder="During a match, a UFO may hover over the field and teleport the robot away, causing us to instantly forfeit the match and lose valuable ranking points."
              value={risk.description}
              className="w-full max-w-md bg-background"
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setRisks((prev) =>
                  prev.map((r, i) =>
                    i === index ? { ...r, description: e.target.value } : r
                  )
                )
              }
            />
            <div className="flex flex-row gap-4">
              <div className="w-full">
                <Label className="mb-1">Likelihood:</Label>
                <Select
                  defaultValue={risk.likelihood.toString()}
                  onValueChange={(v) =>
                    setRisks((prev) =>
                      prev.map((r, i) =>
                        i === index
                          ? {
                              ...r,
                              likelihood: Number(v) as 1 | 2 | 3 | 4 | 5,
                              score: calculateRiskScore(
                                Number(v) as 1 | 2 | 3 | 4 | 5,
                                r.impact,
                                r.detectability
                              ),
                            }
                          : r
                      )
                    )
                  }
                >
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Select Risk Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <SelectItem key={level} value={level.toString()}>
                        {level}: {likelihoodLevels[level as 1 | 2 | 3 | 4 | 5]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full">
                <Label className="mb-1">Impact:</Label>
                <Select
                  defaultValue={risk.impact.toString()}
                  onValueChange={(v) =>
                    setRisks((prev) =>
                      prev.map((r, i) =>
                        i === index
                          ? {
                              ...r,
                              impact: Number(v) as 1 | 2 | 3 | 4 | 5,
                              score: calculateRiskScore(
                                r.likelihood,
                                Number(v) as 1 | 2 | 3 | 4 | 5,
                                r.detectability
                              ),
                            }
                          : r
                      )
                    )
                  }
                >
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Select Risk Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <SelectItem key={level} value={level.toString()}>
                        {level}: {impactLevels[level as 1 | 2 | 3 | 4 | 5]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full">
                <Label className="mb-1">Detectability:</Label>
                <Select
                  defaultValue={risk.detectability.toString()}
                  onValueChange={(v) =>
                    setRisks((prev) =>
                      prev.map((r, i) =>
                        i === index
                          ? {
                              ...r,
                              detectability: Number(v) as 1 | 2 | 3 | 4 | 5,
                              score: calculateRiskScore(
                                r.likelihood,
                                r.impact,
                                Number(v) as 1 | 2 | 3 | 4 | 5
                              ),
                            }
                          : r
                      )
                    )
                  }
                >
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Select Risk Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <SelectItem key={level} value={level.toString()}>
                        {level}:{" "}
                        {detectabilityLevels[level as 1 | 2 | 3 | 4 | 5]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
