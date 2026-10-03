import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { JSX } from 'react'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faArrowDown,
  faArrowLeft,
  faArrowRight,
  faArrowRightArrowLeft,
  faArrowTrendUp,
  faBars,
  faBell,
  faBolt,
  faCalendar,
  faChartLine,
  faCheck,
  faChevronDown,
  faChevronRight,
  faCircleQuestion,
  faCreditCard,
  faDownload,
  faEye,
  faEyeSlash,
  faEnvelope,
  faFileInvoice,
  faFileLines,
  faGear,
  faHouse,
  faLightbulb,
  faLock,
  faMagnifyingGlass,
  faMoneyBillTransfer,
  faMoneyBillTrendUp,
  faMoneyBillWave,
  faEllipsis,
  faMinus,
  faPlus,
  faRepeat,
  faRightFromBracket,
  faSpinner,
  faTags,
  faPenToSquare,
  faTrashCan,
  faBullseye,
  faTriangleExclamation,
  faUser,
  faWallet,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { faEnvelopeOpen } from '@fortawesome/free-regular-svg-icons'
import { faGoogle } from '@fortawesome/free-brands-svg-icons'

type IconProps = {
  size?: number
  className?: string
  strokeWidth?: number
  'aria-hidden'?: boolean | 'true' | 'false'
}

export type IconComponent = (props: IconProps) => JSX.Element

function icon(definition: IconDefinition): IconComponent {
  return function FinflowIcon({ size = 16, className, 'aria-hidden': ariaHidden = true }: IconProps) {
    return <FontAwesomeIcon icon={definition} width={size} height={size} className={className} aria-hidden={ariaHidden} />
  }
}

export const Activity = icon(faBolt)
export const ArrowDownLeft = icon(faArrowDown)
export const ArrowDownRight = icon(faArrowDown)
export const ArrowLeft = icon(faArrowLeft)
export const ArrowLeftRight = icon(faArrowRightArrowLeft)
export const ArrowRight = icon(faArrowRight)
export const ArrowUpRight = icon(faArrowTrendUp)
export const Bell = icon(faBell)
export const ChartNoAxesCombined = icon(faChartLine)
export const Check = icon(faCheck)
export const ChevronDown = icon(faChevronDown)
export const ChevronRight = icon(faChevronRight)
export const CircleHelp = icon(faCircleQuestion)
export const Construction = icon(faTriangleExclamation)
export const CreditCard = icon(faCreditCard)
export const Download = icon(faDownload)
export const Eye = icon(faEye)
export const EyeOff = icon(faEyeSlash)
export const FileText = icon(faFileLines)
export const HelpCircle = icon(faCircleQuestion)
export const LayoutDashboard = icon(faHouse)
export const LoaderCircle = icon(faSpinner)
export const LogOut = icon(faRightFromBracket)
export const Google = icon(faGoogle)
export const MailCheck = icon(faEnvelopeOpen)
export const Messages = icon(faEnvelope)
export const Menu = icon(faBars)
export const MoreHorizontal = icon(faEllipsis)
export const PanelLeftClose = icon(faArrowLeft)
export const PanelLeftOpen = icon(faArrowRight)
export const Plus = icon(faPlus)
export const ReceiptText = icon(faFileInvoice)
export const Repeat2 = icon(faRepeat)
export const Search = icon(faMagnifyingGlass)
export const Settings = icon(faGear)
export const Sparkles = icon(faLightbulb)
export const Target = icon(faBullseye)
export const TrendingUp = icon(faMoneyBillTrendUp)
export const UserRound = icon(faUser)
export const Wallet = icon(faWallet)
export const WalletCards = icon(faMoneyBillTransfer)
export const X = icon(faXmark)
export const ArrowUp = icon(faArrowDown)
export const ArrowDown = icon(faArrowDown)
export const Money = icon(faMoneyBillWave)
export const Tags = icon(faTags)
export const Lock = icon(faLock)
export const Calendar = icon(faCalendar)
export const Minus = icon(faMinus)
export const Edit = icon(faPenToSquare)
export const Trash = icon(faTrashCan)
