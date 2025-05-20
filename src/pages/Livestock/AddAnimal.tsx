import { useState, useEffect } from "react"
import { db } from "../../lib/firebase"
import { collection, setDoc, getDocs, doc, Timestamp } from "firebase/firestore"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { addToast } from "@heroui/toast"
import { Download } from "lucide-react"
import QRcode from "react-qr-code"
import html2canvas from "html2canvas"

function AddAnimal() {
  const [name, setName] = useState("")
  const [breed, setBreed] = useState("")
  const [dob, setDOB] = useState("")
  const [id, setId] = useState("")
  const [type, setType] = useState("")
  const [error, setError] = useState("")
  const [breeds, setBreeds] = useState<string[]>([]); 
  const [isDownloaded, setIsDownloaded] = useState(false)
  
  const fetchBreeds = async () => {
    try {
      const breedsCollection = collection(db, "farm", "information", "breeds");
      const snapshot = await getDocs(breedsCollection)
      const breedList = snapshot.docs.map(doc => doc.data().name) // Assuming each breed document has a 'name' field
      setBreeds(breedList)
    } catch (error) {
      console.error("Error fetching breeds:", error)
    }
  }

  const handleDownloadPNG = () => {
    const qrCodeElement = document.getElementById("qrcode");
    const padding = 40; // adjust the padding size as needed
  
    if (qrCodeElement) {
      html2canvas(qrCodeElement).then((canvas) => {
        const paddedCanvas = document.createElement("canvas");
        paddedCanvas.width = canvas.width + padding * 2;
        paddedCanvas.height = canvas.height + padding   * 2;
  
        const ctx = paddedCanvas.getContext("2d");
  
        if (ctx) {
          // Fill background with white
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, paddedCanvas.width, paddedCanvas.height);
  
          // Draw original canvas onto padded canvas
          ctx.drawImage(canvas, padding, padding);
        } else {
          console.error("Failed to get 2D context for the canvas.");
          return;
        }
  
        // Draw original canvas onto padded canvas
        ctx.drawImage(canvas, padding, padding);
  
        // Convert padded canvas to PNG
        const imageUrl = paddedCanvas.toDataURL("image/png");
  
        // Create a download link
        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = `${id}-qrcode.png`;
        link.click();
  
        setIsDownloaded(true);
      });
    }
  };
  
  useEffect(() => {
    const fetchAnimalIds = async () => {
      try {
        const animalCollection = collection(db, "animals");
        const snapshot = await getDocs(animalCollection);
  
        const animalIds = snapshot.docs.map(doc => doc.id); // use doc.id, not doc.data()
  
        const usedNumbers = new Set<number>();
  
        animalIds.forEach(id => {
          const match = id.match(/cow-(\d{3})/);
          if (match) {
            usedNumbers.add(parseInt(match[1]));
          }
        });
  
        // Find the lowest unused number
        let newNumber = 1;
        while (usedNumbers.has(newNumber)) {
          newNumber++;
        }
  
        const nextId = `cow-${String(newNumber).padStart(3, "0")}`;
        setId(nextId);
        console.log("Next available ID:", nextId);
  
      } catch (error) {
        console.error("Error fetching animal IDs:", error);
        setId("cow-001");
      }
    };
    fetchAnimalIds()
    fetchBreeds()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isDownloaded) {
      addToast({
        title: "Warning",
        description: "Please download the QR Code before submitting.",
        color: "warning",
      })
      return
    }

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

      addToast({
        title: "Animal Added",
        description: `Animal ${name} has been added successfully.`,
        color: "success",
      })

      setName("")
      setBreed("")
      setDOB("")
      setType("")
      setIsDownloaded(false)
    } catch (error) {
      console.error("Error adding animal:", error)
      alert("Failed to add animal.")
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl w-full mx-auto">
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
            <Select value={breed} onValueChange={setBreed}>
              <SelectTrigger>
                <SelectValue placeholder="Select Breed" />
              </SelectTrigger>
              <SelectContent>
                {breeds.map((breedOption: string, index: number) => (
                  <SelectItem key={index} value={breedOption}>
                    {breedOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            </div>

            {/* Date of Birth */}
            <div className="grid gap-1.5">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={dob}
                onChange={(e) => setDOB(e.target.value)}
                required
              />
            </div>

            <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }} id="qrcode">
              <QRcode value={id} size={128} />
            </div>

            {id && name && breed && type && (
              <div className="grid gap-1.5">
              <Label >Animal QR Code</Label>
              <p className="text-muted-foreground text-small">This QR code is unique to the animal.</p>
              <Button variant="outline" type="button" onClick={handleDownloadPNG}>
                <Download className="mr-2 h-4 w-4" /> Download QR Code
              </Button>
            </div>            
            )}

            {/* Error Message */}
            {error && <p className="text-sm text-red-500">{error}</p>}

            {/* Submit Button */}
            <Button type="submit" className="w-full">
              Add Animal
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default AddAnimal
