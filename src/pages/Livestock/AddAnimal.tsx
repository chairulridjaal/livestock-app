import { useState, useEffect } from "react"
import { db } from "../../lib/firebase"
import { collection, setDoc, getDocs, doc, Timestamp } from "firebase/firestore"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function AddAnimal() {
  const [name, setName] = useState("")
  const [breed, setBreed] = useState("")
  const [dob, setDOB] = useState("")
  const [id, setId] = useState("")
  const [type, setType] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchAnimalIds = async () => {
      try {
        const animalCollection = collection(db, "animals")
        const snapshot = await getDocs(animalCollection)
        const animals = snapshot.docs.map(doc => doc.data())

        if (animals.length === 0) {
          setId("cow-001")
          return
        }

        const lastId = animals[animals.length - 1].id
        if (lastId) {
          const lastNumber = parseInt(lastId.split("-")[1])
          const nextId = `cow-${String(lastNumber + 1).padStart(3, "0")}`
          setId(nextId)
        } else {
          setId("cow-001")
        }
      } catch (error) {
        console.error("Error fetching animal IDs:", error)
      }
    }

    fetchAnimalIds()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !breed || !dob || !id || !type) {
      return alert("Please fill all fields.")
    }

    const formattedDOB = new Date(dob)
    const today = new Date()

    if (formattedDOB > today) {
      setError("Date of birth cannot be in the future.")
      return
    } else {
      setError("")
    }

    try {
      await setDoc(doc(db, "animals", id), {
        id,
        name,
        breed,
        type,
        dob: Timestamp.fromDate(formattedDOB),
      })

      alert("New animal added!")

      setName("")
      setBreed("")
      setDOB("")
      setType("")
    } catch (error) {
      console.error("Error adding animal:", error)
      alert("Failed to add animal.")
    }
  }

  return (
    <Card className="max-w-xl mx-auto p-6 mt-6">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Add New Animal</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="grid gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          {/* Type */}
          <div className="grid gap-1.5">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={(value) => setType(value)} required>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beef Cattle">Beef Cattle (Sapi Potong)</SelectItem>
                <SelectItem value="Dairy Cattle">Dairy Cattle (Sapi Perah)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Breed */}
          <div className="grid gap-1.5">
            <Label htmlFor="breed">Breed</Label>
            <Input id="breed" value={breed} onChange={(e) => setBreed(e.target.value)} required />
          </div>

          {/* Date of Birth */}
          <div className="grid gap-1.5">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input id="dob" type="date" value={dob} onChange={(e) => setDOB(e.target.value)} required />
          </div>

          {/* Error Message */}
          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Submit Button */}
          <Button type="submit" className="w-full">
            Add Animal
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default AddAnimal
