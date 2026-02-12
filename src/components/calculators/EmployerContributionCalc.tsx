import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import SliderInput from './shared/SliderInput';
import ResultCard from './shared/ResultCard';

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

interface YearProjection {
  year: number;
  trumpAccountBalance: number;
  without401kBalance: number;
  employerTrumpContrib: number;
}

export default function EmployerContributionCalc() {
  const [salary, setSalary] = useState(75000);
  const [employerContrib, setEmployerContrib] = useState(2500);
  const [personalContrib, setPersonalContrib] = useState(200);
  const [annualReturn, setAnnualReturn] = useState(8);
  const [years, setYears] = useState(18);

  const result = useMemo(() => {
    const rate = annualReturn / 100;
    const annualPersonal = Math.min(personalContrib * 12, 5000);
    const cappedEmployer = Math.min(employerContrib, 2500);
    const totalAnnual = Math.min(annualPersonal + cappedEmployer, 5000);

    let withEmployer = 1000; // pilot deposit
    let withoutEmployer = 1000;
    const projections: YearProjection[] = [];

    for (let y = 1; y <= years; y++) {
      withEmployer = (withEmployer + totalAnnual) * (1 + rate);
      withoutEmployer = (withoutEmployer + annualPersonal) * (1 + rate);

      projections.push({
        year: y,
        trumpAccountBalance: Math.round(withEmployer),
        without401kBalance: Math.round(withoutEmployer),
        employerTrumpContrib: Math.round(cappedEmployer * y),
      });
    }

    const taxSavingsPerYear = cappedEmployer; // Employer contributions tax-free under §128
    const totalTaxSavings = taxSavingsPerYear * years;
    const compensationLift = ((cappedEmployer / salary) * 100).toFixed(2);

    return {
      projections,
      withEmployerFinal: Math.round(withEmployer),
      withoutEmployerFinal: Math.round(withoutEmployer),
      difference: Math.round(withEmployer - withoutEmployer),
      totalTaxSavings: Math.round(totalTaxSavings),
      compensationLift,
      cappedEmployer,
    };
  }, [salary, employerContrib, personalContrib, annualReturn, years]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-surface-600 bg-surface-800 p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-white">Your Employment Details</h2>

        <SliderInput
          label="Annual Salary"
          value={salary}
          min={30000}
          max={200000}
          step={5000}
          onChange={setSalary}
          prefix="$"
        />

        <SliderInput
          label="Employer Trump Account Contribution"
          value={employerContrib}
          min={0}
          max={2500}
          step={100}
          onChange={setEmployerContrib}
          prefix="$"
          suffix="/yr"
          helpText="Employers can contribute up to $2,500/year per employee (tax-free under IRC §128)"
        />

        <SliderInput
          label="Your Monthly Contribution"
          value={personalContrib}
          min={0}
          max={417}
          step={25}
          onChange={setPersonalContrib}
          prefix="$"
          helpText={`Combined limit: $5,000/year. You: $${(personalContrib * 12).toLocaleString()} + Employer: $${employerContrib.toLocaleString()} = $${Math.min(personalContrib * 12 + employerContrib, 5000).toLocaleString()}`}
        />

        <SliderInput
          label="Expected Annual Return"
          value={annualReturn}
          min={4}
          max={12}
          step={0.5}
          onChange={setAnnualReturn}
          suffix="%"
        />

        <SliderInput
          label="Years of Growth"
          value={years}
          min={1}
          max={18}
          step={1}
          onChange={setYears}
          suffix=" years"
        />
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ResultCard
          label="With Employer Match"
          value={fmt(result.withEmployerFinal)}
          highlight
        />
        <ResultCard
          label="Without Employer Match"
          value={fmt(result.withoutEmployerFinal)}
        />
        <ResultCard
          label="Extra from Employer"
          value={fmt(result.difference)}
          sublabel="Additional growth from match"
        />
        <ResultCard
          label="Compensation Lift"
          value={`+${result.compensationLift}%`}
          sublabel={`${fmt(result.cappedEmployer)}/yr tax-free`}
        />
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-surface-600 bg-surface-800 p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-300">
          Growth: With vs Without Employer Contribution
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={result.projections} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 12, fill: '#9E9E9E' }}
              label={{ value: 'Year', position: 'insideBottom', offset: -5, fontSize: 12, fill: '#9E9E9E' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#9E9E9E' }}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                fmt(value),
                name === 'trumpAccountBalance' ? 'With Employer Match' : 'Without Employer Match',
              ]}
              labelFormatter={(label: number) => `Year ${label}`}
              contentStyle={{ borderRadius: '8px', border: '1px solid #333333', backgroundColor: '#1a1a1a', color: '#f5f5f5' }}
            />
            <Legend
              formatter={(value: string) =>
                value === 'trumpAccountBalance' ? 'With Employer Match' : 'Without Match'
              }
            />
            <Bar dataKey="trumpAccountBalance" fill="#C5A059" radius={[4, 4, 0, 0]} />
            <Bar dataKey="without401kBalance" fill="#444444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Key info box */}
      <div className="rounded-lg border border-gold-400/30 bg-gold-400/10 p-4">
        <h3 className="font-semibold text-gold-300">How Employer Contributions Work</h3>
        <ul className="mt-2 space-y-1 text-sm text-gold-400">
          <li>&bull; Employers can contribute up to <strong>$2,500/year per employee</strong> (not per child)</li>
          <li>&bull; Employer contributions are <strong>tax-free</strong> under IRC §128</li>
          <li>&bull; Employer + personal contributions combined cannot exceed <strong>$5,000/year</strong></li>
          <li>&bull; This is a new employee benefit — ask your HR department about it</li>
        </ul>
      </div>
    </div>
  );
}
