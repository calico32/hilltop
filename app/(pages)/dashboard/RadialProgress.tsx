const strokeWidth = 20
const radius = 80
const circleCircumference = 2 * Math.PI * radius
const halfCircle = radius + strokeWidth

interface RadialProgressProps {
  appNum: number
  accepted: number
}

export default function RadialProgress({ appNum, accepted }: RadialProgressProps): JSX.Element {
  return (
    <>
      <svg
        width={halfCircle * 2}
        height={halfCircle * 2}
        viewBox={`0 0 ${halfCircle * 2} ${halfCircle * 2}`}
      >
        <g transform="rotate(270, 100, 100)">
          {/* <circle cx="6em" cy="6em" strokeWidth="1em" r="4em" fill="white" stroke="red" /> */}
          <circle
            cx="50%"
            cy="50%"
            strokeWidth={strokeWidth}
            r={radius}
            fill="transparent"
            stroke="#00843d"
            strokeDasharray={circleCircumference}
            strokeDashoffset={0}
            strokeLinecap="round"
          />
          <circle
            cx="50%"
            cy="50%"
            strokeWidth={strokeWidth}
            r={radius}
            fill="transparent"
            stroke="#00b156"
            strokeDasharray={circleCircumference}
            strokeDashoffset={circleCircumference * (accepted / appNum) + circleCircumference} ///{circleCircumference * (accepted / appNum)}
          />
        </g>
        <text color="black" x={radius - 38} y={radius + 32}>
          {appNum} Application{appNum === 1 ? '' : 's'}
        </text>
        <text color="black" x={radius - 28} y={radius}>
          {accepted} Accepted
        </text>
      </svg>
    </>
  )
}
