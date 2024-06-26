interface LogoProps {
  dark?: boolean
  size?: number
}

export default function Logo({ dark, size }: LogoProps): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      viewBox="-11 0 651 512"
      width={size || 32}
      fill={dark ? '#10b981' : '#047857'}
    >
      <path d="m150 311 25 41 48-64h61l-60-99-74 122zm74-183q19 1 29 17l190 314q10 17 1 35-11 17-30 18H35q-20-1-31-18-9-18 1-35l190-314q10-16 29-17z" />
      <path
        fillOpacity=".4"
        d="M336 0q-20 1-34 14-13 14-14 34v92l71 119q4-3 9-3h32q15 1 16 16v32q-1 15-16 16h-3l73 122q19 34 2 68l-2 2h122q20-1 34-14 13-14 14-34V240q-1-20-14-34-14-13-34-14h-24v-72q-2-22-24-24-22 2-24 24v72h-40V48q-1-20-14-34-14-13-34-14h-96zm32 64h32q15 1 16 16v32q-1 15-16 16h-32q-15-1-16-16V80q1-15 16-16zm-16 112q1-15 16-16h32q15 1 16 16v32q-1 15-16 16h-32q-15-1-16-16v-32zm160 96q1-15 16-16h32q15 1 16 16v32q-1 15-16 16h-32q-15-1-16-16v-32zm16 80h32q15 1 16 16v32q-1 15-16 16h-32q-15-1-16-16v-32q1-15 16-16z"
      />
    </svg>
  )
}
