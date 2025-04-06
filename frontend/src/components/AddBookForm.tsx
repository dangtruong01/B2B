"use client"

import { useState } from "react"
import axios from "axios"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Upload, Sparkles, Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"

const bookFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  author: z.string().min(1, { message: "Author is required" }),
  genre: z.string().min(1, { message: "Genre is required" }),
  condition: z.enum(["New", "Good", "Fair", "Poor"]),
  description: z.string().optional(),
  status: z.enum(["available", "unavailable", "reserved", "exchanged"])
})

type BookFormValues = z.infer<typeof bookFormSchema>

interface AddBookFormProps {
  onSuccess: (newBook: any) => void
  onCancel: () => void
}

export default function AddBookForm({ onSuccess, onCancel }: AddBookFormProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAutoFilling, setIsAutoFilling] = useState(false)
  const [bookTitle, setBookTitle] = useState("")

  const bookGenres = [
    "Fiction", "Non-Fiction", "Mystery", "Science Fiction", "Fantasy",
    "Romance", "Thriller", "Horror", "Biography", "History", "Self-Help",
    "Business", "Children's", "Young Adult", "Comics & Graphic Novels",
    "Poetry", "Other"
  ]

  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: "",
      author: "",
      genre: "",
      condition: "Fair",
      description: "",
      status: "Available"
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const autoFillForm = async () => {
    if (!bookTitle.trim()) {
      toast.error("Please enter a book title first")
      return
    }

    try {
      setIsAutoFilling(true)

      const response = await axios.post(
        "http://localhost:8000/books/auto-fill",
        { title: bookTitle },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      )

      const bookData = response.data

      form.setValue("title", bookData.title || bookTitle)
      form.setValue("author", bookData.author || "")
      form.setValue("description", bookData.description || "")

      const matchedGenre = bookGenres.find(
        (genre) => bookData.genre?.toLowerCase() === genre.toLowerCase()
      ) || "Other"

      form.setValue("genre", matchedGenre)

      toast.success("Book information auto-filled!")
    } catch (error) {
      console.error("Auto-fill error:", error)
      toast.error("Failed to auto-fill. Try again later.")
    } finally {
      setIsAutoFilling(false)
    }
  }

  const onSubmit = async (values: BookFormValues) => {
    try {
      setIsSubmitting(true)
      const accessToken = localStorage.getItem("access_token")
      if (!accessToken) {
        toast.error("Authentication error. Please log in again.")
        return
      }

      const formData = new FormData()
      formData.append("title", values.title)
      formData.append("author", values.author)
      formData.append("genre", values.genre)
      formData.append("condition", values.condition)
      formData.append("status", values.status)
      if (values.description) formData.append("description", values.description)
      if (selectedImage) formData.append("image", selectedImage)

      const response = await axios.post("http://localhost:8000/books/", formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      })

      onSuccess()
      form.reset()
      setSelectedImage(null)
      setImagePreview(null)
      setBookTitle("")
      toast.success("Book added successfully!")
    } catch (err) {
      console.error("Error adding book:", err)
      toast.error("Error adding book. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Image Upload */}
        <div className="space-y-2">
          <Label htmlFor="book-image">Book Cover Image</Label>
          <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4">
            {imagePreview ? (
              <div className="relative w-full">
                <img src={imagePreview} alt="Preview" className="mx-auto max-h-40 object-contain" />
                <Button type="button" variant="ghost" size="sm" className="absolute top-0 right-0"
                  onClick={() => { setSelectedImage(null); setImagePreview(null) }}>
                  Remove
                </Button>
              </div>
            ) : (
              <div className="w-full text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2 flex text-sm text-gray-600 justify-center">
                  <label htmlFor="book-image" className="cursor-pointer font-medium text-purple-600 hover:text-purple-500">
                    <span>Upload a file</span>
                    <input id="book-image" name="book-image" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Auto-fill */}
        <div className="space-y-2 p-4 border rounded-lg bg-purple-50">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <Input
              placeholder="Enter a book title to auto-fill details"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
            />
            <Button type="button" onClick={autoFillForm} disabled={isAutoFilling} className="bg-purple-600 hover:bg-purple-700">
              {isAutoFilling ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Auto-filling</> : <><Sparkles className="mr-2 h-4 w-4" /> Auto-fill</>}
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Enter a book title and click auto-fill to populate book details using AI
          </p>
        </div>

        {/* Title Field */}
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl><Input placeholder="Enter book title" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        {/* Author */}
        <FormField control={form.control} name="author" render={({ field }) => (
          <FormItem>
            <FormLabel>Author</FormLabel>
            <FormControl><Input placeholder="Enter author name" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        {/* Genre */}
        <FormField control={form.control} name="genre" render={({ field }) => (
          <FormItem>
            <FormLabel>Genre</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select a genre" /></SelectTrigger></FormControl>
              <SelectContent>
                {bookGenres.map((genre) => (
                  <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        {/* Condition */}
        <FormField control={form.control} name="condition" render={({ field }) => (
          <FormItem>
            <FormLabel>Condition</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Good">Good</SelectItem>
                <SelectItem value="Fair">Fair</SelectItem>
                <SelectItem value="Poor">Poor</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        {/* Description */}
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl><Textarea placeholder="Add a short description" className="resize-none" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        {/* Status */}
        <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Book Status</FormLabel>
                <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="unavailable">Unavailable</SelectItem>
                        <SelectItem value="reserved">Reserved</SelectItem>
                        <SelectItem value="exchanged">Exchanged</SelectItem>
                    </SelectContent>
                    </Select>
                </FormControl>
                <FormDescription>
                    This controls the availability of the book for exchange.
                </FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Book"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
