"use client"

import type React from "react"

import { useState } from "react"
import { MapPin, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface LocationSearchProps {
  currentLocation: string
  onLocationChange: (location: string) => void
}

export function LocationSearch({ currentLocation, onLocationChange }: LocationSearchProps) {
  const [isSearching, setIsSearching] = useState(false)
  const [searchValue, setSearchValue] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      onLocationChange(searchValue.trim())
      setIsSearching(false)
      setSearchValue("")
    }
  }

  if (isSearching) {
    return (
      <form onSubmit={handleSearch} className="flex items-center gap-2 glass rounded-2xl px-4 py-2">
        <Search className="w-5 h-5 text-white/70" />
        <Input
          type="text"
          placeholder="Search location..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="bg-transparent border-none text-white placeholder:text-white/50 focus-visible:ring-0 focus-visible:ring-offset-0"
          autoFocus
        />
        <Button type="submit" size="sm" className="bg-white/20 hover:bg-white/30 text-white">
          Go
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setIsSearching(false)}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          Cancel
        </Button>
      </form>
    )
  }

  return (
    <button
      onClick={() => setIsSearching(true)}
      className="flex items-center gap-2 glass rounded-2xl px-6 py-3 text-white hover:bg-white/20 transition-colors"
    >
      <MapPin className="w-5 h-5" />
      <span className="text-lg font-medium">{currentLocation}</span>
      <Search className="w-4 h-4 ml-2 text-white/70" />
    </button>
  )
}
