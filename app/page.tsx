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
  TextCursorInput,
} from "lucide-react";
import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  type Hazard = {
    name: string;
    description: string;
    likelihood: 1 | 2 | 3 | 4 | 5;
    impact: 1 | 2 | 3 | 4 | 5;
    detectability: 1 | 2 | 3 | 4 | 5;
    score: number;
    mitigation: Hazard | null;
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

  const [hazards, setHazards] = React.useState<Hazard[]>([]);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = React.useState<
    number | null
  >(null);
  const [sort, setSort] = React.useState("score-desc");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [newTagInput, setNewTagInput] = React.useState<{
    [key: number]: string;
  }>({});

  React.useEffect(() => {
    const savedHazards = localStorage.getItem("hazards");
    if (savedHazards) {
      try {
        setHazards(JSON.parse(savedHazards));
      } catch (error) {
        console.error("Failed to parse hazards from localStorage:", error);
      }
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem("hazards", JSON.stringify(hazards));
  }, [hazards]);

  function calculateHazardScore(
    likelihood: number,
    impact: number,
    detectability: number
  ) {
    return likelihood * impact * detectability;
  }

  function getHazardScoreColor(score: number) {
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

  function getHazardCardClasses(score: number) {
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

  function getEffectiveScore(hazard: Hazard) {
    if (hazard.mitigated) {
      return hazard.mitigation?.score ?? hazard.score;
    }
    return hazard.score;
  }

  function getHazardBucketCounts() {
    const nonNewHazards = hazards.filter((h) => !h.isNew);
    const low = nonNewHazards.filter((h) => getEffectiveScore(h) <= 10).length;
    const medium = nonNewHazards.filter(
      (h) => getEffectiveScore(h) > 10 && getEffectiveScore(h) <= 40
    ).length;
    const high = nonNewHazards.filter(
      (h) => getEffectiveScore(h) > 40 && getEffectiveScore(h) <= 80
    ).length;
    const critical = nonNewHazards.filter(
      (h) => getEffectiveScore(h) > 80
    ).length;

    return { low, medium, high, critical, total: nonNewHazards.length };
  }

  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-row gap-2 items-center">
        {hazards.length > 0 && (
          <>
            <Button
              onClick={() => {
                setHazards((prev) => {
                  const saved = prev.map((h) =>
                    h.isNew
                      ? {
                          ...h,
                          isNew: false,
                          score: calculateHazardScore(
                            h.likelihood,
                            h.impact,
                            h.detectability
                          ),
                        }
                      : h
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
              Add Hazard
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
                {getHazardBucketCounts().low}
              </p>
            </div>
            <div className="border-2 border-yellow-500 bg-yellow-950 h-9 flex items-center px-2 justify-center">
              <p>
                <span className="text-muted-foreground">Medium:</span>{" "}
                {getHazardBucketCounts().medium}
              </p>
            </div>
            <div className="border-2 border-orange-500 bg-orange-950 h-9 flex items-center px-2 justify-center">
              <p>
                <span className="text-muted-foreground">High:</span>{" "}
                {getHazardBucketCounts().high}
              </p>
            </div>
            <div className="border-2 border-red-500 bg-red-950 h-9 flex items-center px-2 justify-center">
              <p>
                <span className="text-muted-foreground">Critical:</span>{" "}
                {getHazardBucketCounts().critical}
              </p>
            </div>
            <Input
              placeholder="Search hazards..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
              className="ml-auto max-w-sm"
            />
          </>
        )}
        {hazards.length === 0 && (
          <div className="w-full border border-dashed p-4 text-center">
            <h2 className="font-bold mt-10">
              You haven&apos;t added any{" "}
              <Link
                href="https://www.youtube.com/watch?v=eO9vHakAloU"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                hazards
              </Link>{" "}
              yet!
            </h2>
            <Image
              src="/explosion.png"
              alt="No hazards added"
              width={512}
              height={340}
              className="mx-auto mt-6"
            />
            <Button
              className="mb-10"
              onClick={() => {
                setHazards((prev) => [
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
      {hazards
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
          (hazard) =>
            hazard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            hazard.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            hazard.tags.some((tag) =>
              tag.toLowerCase().includes(searchQuery.toLowerCase())
            ) ||
            hazard.mitigation?.name
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            hazard.mitigation?.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
        )
        .map((hazard, index) => (
          <div
            key={index}
            className={`p-4 flex flex-col ${getHazardCardClasses(
              getEffectiveScore(hazard)
            )}`}
          >
            <h2 className="text-lg font-bold flex flex-row gap-2 items-center">
              <Input
                placeholder="Aliens can abduct the robot during matches"
                value={hazard.name}
                className="w-full max-w-md bg-background h-10"
                autoFocus={hazard.isNew}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setHazards((prev) =>
                    prev.map((h, i) =>
                      i === index ? { ...h, name: e.target.value } : h
                    )
                  )
                }
              />
              <p className="ml-4">Score:</p>
              <p
                className={`border w-fit px-2 flex items-center h-10 font-mono relative ${getHazardScoreColor(
                  hazard.score
                )}`}
                style={{
                  textDecoration: "none",
                  opacity: hazard.mitigated ? 0.5 : 1,
                }}
              >
                {Number.isFinite(hazard.score)
                  ? String(Math.round(hazard.score)).padStart(3, "0")
                  : "000"}
              </p>
              {hazard.mitigation && (
                <>
                  <ArrowRight className="inline-block" />
                  <p
                    className={`border w-fit px-2 flex items-center h-10 font-mono relative ${getHazardScoreColor(
                      hazard.mitigation?.score ?? 0
                    )}`}
                    style={{
                      textDecoration: "none",
                      opacity: !hazard.mitigated ? 0.5 : 1,
                    }}
                  >
                    {Number.isFinite(hazard.mitigation?.score ?? 0)
                      ? String(
                          Math.round(hazard.mitigation?.score ?? 0)
                        ).padStart(3, "0")
                      : "000"}
                  </p>
                </>
              )}
              <div className="ml-auto flex items-center gap-2">
                {hazard.isNew ? (
                  <>
                    <Button
                      onClick={() => {
                        setHazards((prev) =>
                          prev.map((h, i) =>
                            i === index
                              ? {
                                  ...h,
                                  isNew: false,
                                  score: calculateHazardScore(
                                    h.likelihood,
                                    h.impact,
                                    h.detectability
                                  ),
                                }
                              : h
                          )
                        );
                      }}
                    >
                      <Save />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setHazards((prev) => prev.filter((_, i) => i !== index))
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
                          setHazards((prev) =>
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
              value={hazard.description}
              className="w-full max-w-md bg-background mt-4"
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setHazards((prev) =>
                  prev.map((h, i) =>
                    i === index ? { ...h, description: e.target.value } : h
                  )
                )
              }
            />
            <div className="flex flex-row gap-2 mt-4">
              {hazard.tags.length > 0 && (
                <>
                  {hazard.tags.map((tag, tIndex) => (
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
                  <Button variant="default">
                    {hazard.tags.length > 0 ? (
                      <>
                        <p>Edit Tags</p>
                        <TextCursorInput />
                      </>
                    ) : (
                      <>
                        <p>Add a Tag!</p>
                        <Plus />
                      </>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle className="font-bold text-lg mb-4">
                    Edit Tags
                  </DialogTitle>
                  <div className="flex flex-col gap-2">
                    {hazard.tags.length === 0 && (
                      <p>No tags added yet, why not add one?</p>
                    )}
                    {hazard.tags.map((tag, tIndex) => (
                      <div key={tIndex} className="flex items-center gap-2">
                        <Input
                          value={tag}
                          className="w-full max-w-md bg-background"
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            const newValue = e.target.value;
                            setHazards((prev) =>
                              prev.map((h, i) =>
                                i === index
                                  ? {
                                      ...h,
                                      tags:
                                        newValue === ""
                                          ? h.tags.filter(
                                              (_, j) => j !== tIndex
                                            )
                                          : h.tags.map((t, j) =>
                                              j === tIndex ? newValue : t
                                            ),
                                    }
                                  : h
                              )
                            );
                          }}
                        />
                        <Button
                          variant="destructive"
                          onClick={() =>
                            setHazards((prev) =>
                              prev.map((h, i) =>
                                i === index
                                  ? {
                                      ...h,
                                      tags: h.tags.filter(
                                        (_, j) => j !== tIndex
                                      ),
                                    }
                                  : h
                              )
                            )
                          }
                        >
                          <Trash />
                        </Button>
                      </div>
                    ))}

                    <div className="flex gap-2 mt-3">
                      <Input
                        placeholder="Type a new tag..."
                        value={newTagInput[index] || ""}
                        className="w-full bg-background"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setNewTagInput((prev) => ({
                            ...prev,
                            [index]: e.target.value,
                          }))
                        }
                        onKeyDown={(
                          e: React.KeyboardEvent<HTMLInputElement>
                        ) => {
                          if (e.key === "Enter" && newTagInput[index]?.trim()) {
                            setHazards((prev) =>
                              prev.map((h, i) =>
                                i === index
                                  ? {
                                      ...h,
                                      tags: [
                                        ...h.tags,
                                        newTagInput[index].trim(),
                                      ],
                                    }
                                  : h
                              )
                            );
                            setNewTagInput((prev) => ({
                              ...prev,
                              [index]: "",
                            }));
                          }
                        }}
                      />
                      <Button
                        onClick={() => {
                          if (newTagInput[index]?.trim()) {
                            setHazards((prev) =>
                              prev.map((h, i) =>
                                i === index
                                  ? {
                                      ...h,
                                      tags: [
                                        ...h.tags,
                                        newTagInput[index].trim(),
                                      ],
                                    }
                                  : h
                              )
                            );
                            setNewTagInput((prev) => ({
                              ...prev,
                              [index]: "",
                            }));
                          }
                        }}
                      >
                        Add
                        <Plus />
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex flex-row gap-2 mt-4">
              <div className="w-full">
                <Label className="mb-1 text-muted-foreground">
                  Likelihood:
                </Label>
                <Select
                  value={hazard.likelihood.toString()}
                  onValueChange={(v) =>
                    setHazards((prev) =>
                      prev.map((h, i) =>
                        i === index
                          ? {
                              ...h,
                              likelihood: Number(v) as 1 | 2 | 3 | 4 | 5,
                              score: calculateHazardScore(
                                Number(v) as 1 | 2 | 3 | 4 | 5,
                                h.impact,
                                h.detectability
                              ),
                            }
                          : h
                      )
                    )
                  }
                >
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Select Hazard Level" />
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
                  value={hazard.impact.toString()}
                  onValueChange={(v) =>
                    setHazards((prev) =>
                      prev.map((h, i) =>
                        i === index
                          ? {
                              ...h,
                              impact: Number(v) as 1 | 2 | 3 | 4 | 5,
                              score: calculateHazardScore(
                                h.likelihood,
                                Number(v) as 1 | 2 | 3 | 4 | 5,
                                h.detectability
                              ),
                            }
                          : h
                      )
                    )
                  }
                >
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Select Hazard Level" />
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
                  value={hazard.detectability.toString()}
                  onValueChange={(v) =>
                    setHazards((prev) =>
                      prev.map((h, i) =>
                        i === index
                          ? {
                              ...h,
                              detectability: Number(v) as 1 | 2 | 3 | 4 | 5,
                              score: calculateHazardScore(
                                h.likelihood,
                                h.impact,
                                Number(v) as 1 | 2 | 3 | 4 | 5
                              ),
                            }
                          : h
                      )
                    )
                  }
                >
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Select Hazard Level" />
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
            {hazard.mitigation === null && (
              <Button
                variant="secondary"
                className="mt-4"
                onClick={() => {
                  setHazards((prev) =>
                    prev.map((h, i) =>
                      i === index
                        ? {
                            ...h,
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
                        : h
                    )
                  );
                }}
              >
                Add Mitigation Plan
                <Plus />
              </Button>
            )}
            {hazard.mitigation && (
              <div className="mt-4 p-4 border-l-4 border-green-500 bg-green-950 flex flex-col space-y-2">
                <h3 className="font-bold text-md flex flex-row items-center gap-2">
                  Mitigation {hazard.mitigated ? "" : " Plan"}
                  <Button
                    className="ml-auto"
                    onClick={() =>
                      setHazards((prev) =>
                        prev.map((h, i) =>
                          i === index ? { ...h, mitigated: !h.mitigated } : h
                        )
                      )
                    }
                  >
                    {hazard.mitigated ? (
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
                      setHazards((prev) =>
                        prev.map((h, i) =>
                          i === index
                            ? { ...h, mitigation: null, mitigated: false }
                            : h
                        )
                      )
                    }
                  >
                    <Trash />
                  </Button>
                </h3>
                <Input
                  placeholder="Use anti-gravity tethers to prevent abduction."
                  value={hazard.mitigation.name}
                  className="w-full max-w-md bg-background"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setHazards((prev) =>
                      prev.map((h, i) =>
                        i === index
                          ? {
                              ...h,
                              mitigation: {
                                ...h.mitigation!,
                                name: e.target.value,
                              },
                            }
                          : h
                      )
                    )
                  }
                />
                <Textarea
                  placeholder="Equip the robot with anti-gravity tethers that deploy when UFOs are detected nearby, preventing abduction during matches."
                  value={hazard.mitigation.description}
                  className="w-full max-w-md bg-background"
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setHazards((prev) =>
                      prev.map((h, i) =>
                        i === index
                          ? {
                              ...h,
                              mitigation: {
                                ...h.mitigation!,
                                description: e.target.value,
                              },
                            }
                          : h
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
                      defaultValue={hazard.mitigation.likelihood.toString()}
                      onValueChange={(v) =>
                        setHazards((prev) =>
                          prev.map((h, i) =>
                            i === index
                              ? {
                                  ...h,
                                  mitigation: {
                                    ...h.mitigation!,
                                    likelihood: Number(v) as 1 | 2 | 3 | 4 | 5,
                                    score: calculateHazardScore(
                                      Number(v) as 1 | 2 | 3 | 4 | 5,
                                      h.mitigation!.impact,
                                      h.mitigation!.detectability
                                    ),
                                  },
                                }
                              : h
                          )
                        )
                      }
                    >
                      <SelectTrigger className="w-full bg-background">
                        <SelectValue placeholder="Select Hazard Level" />
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
                      defaultValue={hazard.mitigation.impact.toString()}
                      onValueChange={(v) =>
                        setHazards((prev) =>
                          prev.map((h, i) =>
                            i === index
                              ? {
                                  ...h,
                                  mitigation: {
                                    ...h.mitigation!,
                                    impact: Number(v) as 1 | 2 | 3 | 4 | 5,
                                    score: calculateHazardScore(
                                      h.mitigation!.likelihood,
                                      Number(v) as 1 | 2 | 3 | 4 | 5,
                                      h.mitigation!.detectability
                                    ),
                                  },
                                }
                              : h
                          )
                        )
                      }
                    >
                      <SelectTrigger className="w-full bg-background">
                        <SelectValue placeholder="Select Hazard Level" />
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
                      defaultValue={hazard.mitigation.detectability.toString()}
                      onValueChange={(v) =>
                        setHazards((prev) =>
                          prev.map((h, i) =>
                            i === index
                              ? {
                                  ...h,
                                  mitigation: {
                                    ...h.mitigation!,
                                    detectability: Number(v) as
                                      | 1
                                      | 2
                                      | 3
                                      | 4
                                      | 5,
                                    score: calculateHazardScore(
                                      h.mitigation!.likelihood,
                                      h.mitigation!.impact,
                                      Number(v) as 1 | 2 | 3 | 4 | 5
                                    ),
                                  },
                                }
                              : h
                          )
                        )
                      }
                    >
                      <SelectTrigger className="w-full bg-background">
                        <SelectValue placeholder="Select Hazard Level" />
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
