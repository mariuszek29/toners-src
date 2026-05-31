export default function LearnPage() {
  const topics = [
    {
      title: 'What is Bittensor?',
      body: 'Bittensor is a decentralized network that incentivizes the production of machine intelligence. Validators score miners on the quality of their AI outputs, and TAO emissions reward the best performers.',
    },
    {
      title: 'What is a Subnet?',
      body: 'Subnets are independent markets within Bittensor. Each subnet defines its own task (inference, training, storage, etc.), its own validation logic, and competes for TAO emissions based on its contribution to the network.',
    },
    {
      title: 'What is dTAO?',
      body: 'dTAO (dynamic TAO) is the emissions mechanic that replaced the root network vote. Each subnet has its own AMM pool. Validators stake TAO into subnet pools, which determines how much of the daily TAO emission each subnet receives.',
    },
    {
      title: 'What is Alpha?',
      body: 'Alpha is the subnet-specific token in the dTAO system. When you stake TAO into a subnet pool, you receive Alpha tokens. Alpha price reflects the market\'s conviction in that subnet\'s future emissions.',
    },
    {
      title: 'What is APY in Bittensor?',
      body: 'APY represents the annualized yield from staking TAO into a subnet\'s pool. It fluctuates based on emissions allocated to the subnet and the total TAO staked. High APY can signal undervalued conviction or early positioning.',
    },
    {
      title: 'What is the Nerds Score?',
      body: 'The Nerds Score (0-100) is The Nerds\' editorial assessment of a subnet. It factors in team quality, product progress, thesis strength, community conviction, and risk profile. It is not financial advice.',
    },
    {
      title: 'What is Community Score?',
      body: 'Community Score reflects the aggregated bullish/bearish sentiment from Nerds community votes. The more bullish votes with high confidence, the higher the score. Updated in real time.',
    },
    {
      title: 'How do AMAs work?',
      body: 'The Nerds hosts live AMAs with subnet founders on X (Twitter Spaces). After each AMA, we publish a full recap, key quotes, thesis update, and risk assessment. All content is reviewed by Mariusz before publishing.',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="section-label mb-2">Education</div>
        <h1 className="text-3xl font-mono font-bold text-text-primary mb-2">
          Learn Bittensor
        </h1>
        <p className="text-text-secondary">
          Core concepts for understanding the Bittensor ecosystem and how The Nerds covers it.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {topics.map((topic, i) => (
          <div key={i} className="card p-6">
            <h2 className="font-mono font-bold text-text-primary mb-2">{topic.title}</h2>
            <p className="text-text-secondary leading-relaxed">{topic.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
