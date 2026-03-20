"use client"

import Image from "next/image"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Resource } from "@/lib/types"

interface ResourceCardProps {
  resource: Resource
}

export function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {resource.image_url ? (
          <Image
            src={resource.image_url}
            alt={resource.title}
            fill
            className="object-cover transition-transform hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground text-4xl">
            📦
          </div>
        )}
      </div>

      {/* Content */}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold leading-tight line-clamp-2">
            {resource.title}
          </h3>
          <Badge variant="secondary" className="shrink-0">
            {resource.category}
          </Badge>
        </div>
      </CardHeader>

      {resource.description && (
        <CardContent className="pb-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {resource.description}
          </p>
        </CardContent>
      )}

      {/* Link */}
      <CardFooter className="mt-auto pt-0">
        <Button asChild variant="outline" className="w-full">
          <Link href={resource.link} target="_blank" rel="noopener noreferrer">
            Truy cập tài nguyên →
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
