"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
import { DialogTrigger } from "@radix-ui/react-dialog";
import {
  ArrowRight,
  Plus,
  Save,
  Trash,
  X,
  ShieldCheck,
  Check,
} from "lucide-react";
import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  type Risk = {
    name: string;
    description: string;
    likelihood: 1 | 2 | 3 | 4 | 5;
    impact: 1 | 2 | 3 | 4 | 5;
    detectability: 1 | 2 | 3 | 4 | 5;
    score: number;
    mitigation: Risk | null;
    mitigated: boolean;
    isNew?: boolean;
    tags: string[];
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
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    const savedRisks = localStorage.getItem("risks");
    if (savedRisks) {
      try {
        setRisks(JSON.parse(savedRisks));
      } catch (error) {
        console.error("Failed to parse risks from localStorage:", error);
      }
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem("risks", JSON.stringify(risks));
  }, [risks]);

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

  function getEffectiveScore(risk: Risk) {
    if (risk.mitigated) {
      return risk.mitigation?.score ?? risk.score;
    }
    return risk.score;
  }

  function getRandomTag() {
    const tagList = [
      "AUTO",
      "TELEOP",
      "BASE",
      "Mechanical",
      "Software",
    ] as const;
    return tagList[Math.floor(Math.random() * tagList.length)];
  }
  function getRiskBucketCounts() {
    const nonNewRisks = risks.filter((r) => !r.isNew);
    const low = nonNewRisks.filter((r) => getEffectiveScore(r) <= 10).length;
    const medium = nonNewRisks.filter(
      (r) => getEffectiveScore(r) > 10 && getEffectiveScore(r) <= 40
    ).length;
    const high = nonNewRisks.filter(
      (r) => getEffectiveScore(r) > 40 && getEffectiveScore(r) <= 80
    ).length;
    const critical = nonNewRisks.filter(
      (r) => getEffectiveScore(r) > 80
    ).length;

    return { low, medium, high, critical, total: nonNewRisks.length };
  }

  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-row gap-2 items-center">
        {risks.length > 0 && (
          <>
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
                      mitigated: false,
                      isNew: true,
                      tags: [],
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
            <div className="border-2 h-9 flex items-center px-2 justify-center">
              <p>
                <span className="text-muted-foreground">Low:</span>{" "}
                {getRiskBucketCounts().low}
              </p>
            </div>
            <div className="border-2 border-yellow-500 bg-yellow-950 h-9 flex items-center px-2 justify-center">
              <p>
                <span className="text-muted-foreground">Medium:</span>{" "}
                {getRiskBucketCounts().medium}
              </p>
            </div>
            <div className="border-2 border-orange-500 bg-orange-950 h-9 flex items-center px-2 justify-center">
              <p>
                <span className="text-muted-foreground">High:</span>{" "}
                {getRiskBucketCounts().high}
              </p>
            </div>
            <div className="border-2 border-red-500 bg-red-950 h-9 flex items-center px-2 justify-center">
              <p>
                <span className="text-muted-foreground">Critical:</span>{" "}
                {getRiskBucketCounts().critical}
              </p>
            </div>
            <Input
              placeholder="Search risks..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
              className="ml-auto max-w-sm"
            />
          </>
        )}
        {risks.length === 0 && (
          <div className="w-full border border-dashed p-4 text-center">
            <h2 className="font-bold mt-10">
              You haven&apos;t added any{" "}
              <Link
                href="https://www.youtube.com/watch?v=eO9vHakAloU"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                risks
              </Link>{" "}
              yet!
            </h2>
            <Image
              src="/explosion.png"
              alt="No risks added"
              width={512}
              height={340}
              className="mx-auto mt-6"
            />
            <Button
              className="mb-10"
              onClick={() => {
                setRisks((prev) => [
                  ...prev,
                  {
                    name: "",
                    description: "",
                    likelihood: 1,
                    impact: 1,
                    detectability: 1,
                    score: 1,
                    mitigation: null,
                    mitigated: false,
                    isNew: true,
                    tags: [],
                  },
                ]);
              }}
            >
              Add One!
              <Plus />
            </Button>
          </div>
        )}
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
            const aas = getEffectiveScore(a);
            const bbs = getEffectiveScore(b);
            return aas - bbs;
          } else if (sort === "score-desc") {
            const aas = getEffectiveScore(a);
            const bbs = getEffectiveScore(b);
            return bbs - aas;
          } else if (sort === "name-asc") {
            return a.name.localeCompare(b.name);
          } else if (sort === "name-desc") {
            return b.name.localeCompare(a.name);
          }
          return 0;
        })
        .filter(
          (risk) =>
            risk.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            risk.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            risk.tags.some((tag) =>
              tag.toLowerCase().includes(searchQuery.toLowerCase())
            ) ||
            risk.mitigation?.name
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            risk.mitigation?.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
        )
        .map((risk, index) => (
          <div
            key={index}
            className={`p-4 flex flex-col ${getRiskCardClasses(
              getEffectiveScore(risk)
            )}`}
          >
            <h2 className="text-lg font-bold flex flex-row gap-2 items-center">
              <Input
                placeholder="Aliens can abduct the robot during matches"
                value={risk.name}
                className="w-full max-w-md bg-background h-10"
                autoFocus={risk.isNew}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setRisks((prev) =>
                    prev.map((r, i) =>
                      i === index ? { ...r, name: e.target.value } : r
                    )
                  )
                }
              />
              <p className="ml-4">Score:</p>
              <p
                className={`border w-fit px-2 flex items-center h-10 font-mono relative ${getRiskScoreColor(
                  risk.score
                )}`}
                style={{
                  textDecoration: "none",
                  opacity: risk.mitigated ? 0.5 : 1,
                }}
              >
                {Number.isFinite(risk.score)
                  ? String(Math.round(risk.score)).padStart(3, "0")
                  : "000"}
              </p>
              {risk.mitigation && (
                <>
                  <ArrowRight className="inline-block" />
                  <p
                    className={`border w-fit px-2 flex items-center h-10 font-mono relative ${getRiskScoreColor(
                      risk.mitigation?.score ?? 0
                    )}`}
                    style={{
                      textDecoration: "none",
                      opacity: !risk.mitigated ? 0.5 : 1,
                    }}
                  >
                    {Number.isFinite(risk.mitigation?.score ?? 0)
                      ? String(
                          Math.round(risk.mitigation?.score ?? 0)
                        ).padStart(3, "0")
                      : "000"}
                  </p>
                </>
              )}
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
              className="w-full max-w-md bg-background mt-4"
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setRisks((prev) =>
                  prev.map((r, i) =>
                    i === index ? { ...r, description: e.target.value } : r
                  )
                )
              }
            />
            <div className="flex flex-row gap-2 mt-4">
              {risk.tags.length > 0 && (
                <>
                  {risk.tags.map((tag, tIndex) => (
                    <Button
                      key={tIndex}
                      variant="outline"
                      onClick={() => {
                        setSearchQuery(tag);
                      }}
                    >
                      {tag}
                    </Button>
                  ))}
                </>
              )}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="default" className="w-fit">
                    {risk.tags.length > 0 ? `Edit Tags` : "Add a Tag!"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle className="font-bold text-lg mb-4">
                    Edit Tags
                  </DialogTitle>
                  {risk.tags === null || risk.tags.length === 0 ? (
                    <p className="">
                      No tags added yet, why not{" "}
                      <button
                        className="text-blue-500 hover:underline cursor-pointer"
                        onClick={() => {
                          setRisks((prev) =>
                            prev.map((r, i) =>
                              i === index
                                ? {
                                    ...r,
                                    tags: [getRandomTag()],
                                  }
                                : r
                            )
                          );
                        }}
                      >
                        add one
                      </button>
                      ?
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {risk.tags.map((tag, tIndex) => (
                        <div key={tIndex} className="flex items-center gap-2">
                          <Input
                            value={tag}
                            className="w-full max-w-md bg-background"
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) =>
                              setRisks((prev) =>
                                prev.map((r, i) =>
                                  i === index
                                    ? {
                                        ...r,
                                        tags: r.tags.map((t, j) =>
                                          j === tIndex ? e.target.value : t
                                        ),
                                      }
                                    : r
                                )
                              )
                            }
                            onBlur={() => {
                              if (tag === "") {
                                setRisks((prev) =>
                                  prev.map((r, i) =>
                                    i === index
                                      ? {
                                          ...r,
                                          tags: r.tags.filter(
                                            (_, j) => j !== tIndex
                                          ),
                                        }
                                      : r
                                  )
                                );
                              }
                            }}
                          />
                          <Button
                            variant="destructive"
                            onClick={() =>
                              setRisks((prev) =>
                                prev.map((r, i) =>
                                  i === index
                                    ? {
                                        ...r,
                                        tags: r.tags.filter(
                                          (_, j) => j !== tIndex
                                        ),
                                      }
                                    : r
                                )
                              )
                            }
                          >
                            <Trash />
                          </Button>
                        </div>
                      ))}

                      <div className="flex gap-2 mt-3">
                        <Button
                          onClick={() =>
                            setRisks((prev) =>
                              prev.map((r, i) =>
                                i === index
                                  ? {
                                      ...r,
                                      tags: [...r.tags, getRandomTag()],
                                    }
                                  : r
                              )
                            )
                          }
                        >
                          Add Tag
                          <Plus />
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex flex-row gap-2 mt-4">
              <div className="w-full">
                <Label className="mb-1 text-muted-foreground">
                  Likelihood:
                </Label>
                <Select
                  value={risk.likelihood.toString()}
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
                <Label className="mb-1 text-muted-foreground">Impact:</Label>
                <Select
                  value={risk.impact.toString()}
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
                <Label className="mb-1 text-muted-foreground">
                  Detectability:
                </Label>
                <Select
                  value={risk.detectability.toString()}
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
            {risk.mitigation === null && (
              <Button
                variant="secondary"
                className="mt-4"
                onClick={() => {
                  setRisks((prev) =>
                    prev.map((r, i) =>
                      i === index
                        ? {
                            ...r,
                            isNew: false,
                            mitigation: {
                              name: "",
                              description: "",
                              likelihood: 1,
                              impact: 1,
                              detectability: 1,
                              score: 1,
                              mitigation: null,
                              mitigated: false,
                              tags: [],
                            },
                          }
                        : r
                    )
                  );
                }}
              >
                Add Mitigation Plan
                <Plus />
              </Button>
            )}
            {risk.mitigation && (
              <div className="mt-4 p-4 border-l-4 border-green-500 bg-green-950 flex flex-col space-y-2">
                <h3 className="font-bold text-md flex flex-row items-center gap-2">
                  Mitigation {risk.mitigated ? "" : " Plan"}
                  <Button
                    className="ml-auto"
                    onClick={() =>
                      setRisks((prev) =>
                        prev.map((r, i) =>
                          i === index ? { ...r, mitigated: !r.mitigated } : r
                        )
                      )
                    }
                  >
                    {risk.mitigated ? (
                      <>
                        <span>Mitigated</span>
                        <Check />
                      </>
                    ) : (
                      <>
                        <span>Mark as Mitigated</span>
                        <ShieldCheck />
                      </>
                    )}
                  </Button>
                  <Button
                    className=""
                    variant="destructive"
                    onClick={() =>
                      setRisks((prev) =>
                        prev.map((r, i) =>
                          i === index
                            ? { ...r, mitigation: null, mitigated: false }
                            : r
                        )
                      )
                    }
                  >
                    <Trash />
                  </Button>
                </h3>
                <Input
                  placeholder="Use anti-gravity tethers to prevent abduction."
                  value={risk.mitigation.name}
                  className="w-full max-w-md bg-background"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setRisks((prev) =>
                      prev.map((r, i) =>
                        i === index
                          ? {
                              ...r,
                              mitigation: {
                                ...r.mitigation!,
                                name: e.target.value,
                              },
                            }
                          : r
                      )
                    )
                  }
                />
                <Textarea
                  placeholder="Equip the robot with anti-gravity tethers that deploy when UFOs are detected nearby, preventing abduction during matches."
                  value={risk.mitigation.description}
                  className="w-full max-w-md bg-background"
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setRisks((prev) =>
                      prev.map((r, i) =>
                        i === index
                          ? {
                              ...r,
                              mitigation: {
                                ...r.mitigation!,
                                description: e.target.value,
                              },
                            }
                          : r
                      )
                    )
                  }
                />
                <h3 className="font-semibold mt-4">New scores:</h3>
                <div className="flex flex-row gap-2 w-full">
                  <div className="w-full">
                    <Label className="text-sm text-muted-foreground">
                      Likelihood:
                    </Label>
                    <Select
                      defaultValue={risk.mitigation.likelihood.toString()}
                      onValueChange={(v) =>
                        setRisks((prev) =>
                          prev.map((r, i) =>
                            i === index
                              ? {
                                  ...r,
                                  mitigation: {
                                    ...r.mitigation!,
                                    likelihood: Number(v) as 1 | 2 | 3 | 4 | 5,
                                    score: calculateRiskScore(
                                      Number(v) as 1 | 2 | 3 | 4 | 5,
                                      r.mitigation!.impact,
                                      r.mitigation!.detectability
                                    ),
                                  },
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
                            {likelihoodLevels[level as 1 | 2 | 3 | 4 | 5]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full">
                    <Label className="text-sm text-muted-foreground">
                      Impact:
                    </Label>
                    <Select
                      defaultValue={risk.mitigation.impact.toString()}
                      onValueChange={(v) =>
                        setRisks((prev) =>
                          prev.map((r, i) =>
                            i === index
                              ? {
                                  ...r,
                                  mitigation: {
                                    ...r.mitigation!,
                                    impact: Number(v) as 1 | 2 | 3 | 4 | 5,
                                    score: calculateRiskScore(
                                      r.mitigation!.likelihood,
                                      Number(v) as 1 | 2 | 3 | 4 | 5,
                                      r.mitigation!.detectability
                                    ),
                                  },
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
                    <Label className="text-sm text-muted-foreground">
                      Detectability:
                    </Label>
                    <Select
                      defaultValue={risk.mitigation.detectability.toString()}
                      onValueChange={(v) =>
                        setRisks((prev) =>
                          prev.map((r, i) =>
                            i === index
                              ? {
                                  ...r,
                                  mitigation: {
                                    ...r.mitigation!,
                                    detectability: Number(v) as
                                      | 1
                                      | 2
                                      | 3
                                      | 4
                                      | 5,
                                    score: calculateRiskScore(
                                      r.mitigation!.likelihood,
                                      r.mitigation!.impact,
                                      Number(v) as 1 | 2 | 3 | 4 | 5
                                    ),
                                  },
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
            )}
          </div>
        ))}
    </div>
  );
}
