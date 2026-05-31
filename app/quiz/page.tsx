import Link from 'next/link'

const QUESTIONS = [
  {
    prompt: 'What mainly determines a subnet\'s emissions in dTAO?',
    answer: 'Validator and market conviction expressed through subnet pools.',
  },
  {
    prompt: 'What should a high APY make you ask first?',
    answer: 'Whether the yield reflects opportunity, risk, thin liquidity, or temporary emissions dynamics.',
  },
  {
    prompt: 'What is the point of a Nerds Score?',
    answer: 'A quick editorial read on team quality, product progress, thesis strength, community conviction, and risk.',
  },
]

export default function QuizPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="section-label mb-2">Education</div>
        <h1 className="text-3xl font-mono font-bold text-text-primary mb-2">Bittensor Quiz</h1>
        <p className="text-text-secondary">A quick check on the ideas behind subnet intelligence.</p>
      </div>

      <div className="flex flex-col gap-4">
        {QUESTIONS.map((item, index) => (
          <details key={item.prompt} className="card p-5">
            <summary className="cursor-pointer font-mono font-bold text-text-primary">
              {index + 1}. {item.prompt}
            </summary>
            <p className="mt-3 text-text-secondary">{item.answer}</p>
          </details>
        ))}
      </div>

      <div className="mt-8">
        <Link href="/learn" className="text-sm font-mono text-accent-amber hover:underline">
          Back to Learn
        </Link>
      </div>
    </div>
  )
}
