"use client";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  const [risks, setRisks] = React.useState<Risk[]>([
    {
      name: "SQL Injection",
      description:
        "An attacker can manipulate database queries by injecting malicious SQL code.",
      likelihood: 4,
      impact: 5,
      detectability: 2,
      score: 40,
      mitigation: null,
    },
  ]);

  function calculateRiskScore(
    likelihood: number,
    impact: number,
    detectability: number
  ) {
    return likelihood * impact * detectability;
  }

  return (
    <>
      {risks.map((risk, index) => (
        <div key={index} className="border p-4 mb-4 flex gap-2 flex-col">
          <h2 className="text-lg font-bold mb-2">{risk.name}</h2>
          <p>{risk.description}</p>
          <p>
            Likelihood: {risk.likelihood}, Impact: {risk.impact}, Detectability:{" "}
            {risk.detectability}
          </p>
          <Label>Likelihood:</Label>
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
            <SelectTrigger className="w-full max-w-md">
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
          <Label>Impact:</Label>
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
            <SelectTrigger className="w-full max-w-md">
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
          <Label>Detectability:</Label>
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
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select Risk Level" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((level) => (
                <SelectItem key={level} value={level.toString()}>
                  {level}: {detectabilityLevels[level as 1 | 2 | 3 | 4 | 5]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p>Score: {risk.score}</p>
          {risk.mitigation && (
            <div className="mt-4 p-4 border-t">
              <h3 className="text-md font-semibold mb-2">Mitigation:</h3>
              <p>{risk.mitigation.description}</p>
              <p>
                Likelihood: {risk.mitigation.likelihood}, Impact:{" "}
                {risk.mitigation.impact}, Detectability:{" "}
                {risk.mitigation.detectability}
              </p>
              <p>Score: {risk.mitigation.score}</p>
            </div>
          )}
        </div>
      ))}
    </>
  );
}
