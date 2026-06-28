"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TrendUpIcon, TrendDownIcon } from "@phosphor-icons/react"

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ₹2,45,600.00
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendUpIcon />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Trending up this month{" "}
            <TrendUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Earnings from room bookings and memberships
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Bookings Today</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            18
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendUpIcon />
              +8.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            High occupancy in Indiranagar{" "}
            <TrendUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Desks and meeting rooms currently in use
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Space Utilization</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            74%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendUpIcon />
              +4.2%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Efficient space allocation{" "}
            <TrendUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Average desk/room utilization rate</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Pending Maintenance</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            3 Requests
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20">
              <TrendDownIcon />
              -15%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Cleaning & repairs in progress{" "}
            <TrendDownIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Tickets needing facility attention</div>
        </CardFooter>
      </Card>
    </div>
  )
}
