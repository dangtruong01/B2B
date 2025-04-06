"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { PlusCircle, Menu, Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import BookCard from "@/components/BookCard" // Import the shared BookCard component
import AddBookForm from "@/components/AddBookForm" // Import the AddBookForm component
import BurgerMenu from "@/components/BurgerMenu"

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("my-books")
  const [myBooks, setMyBooks] = useState<any[]>([])
  const [sentRequests, setSentRequests] = useState<any[]>([])
  const [receivedRequests, setReceivedRequests] = useState<any[]>([])
  const [isAddBookDialogOpen, setIsAddBookDialogOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token")
    if (!accessToken) {
      router.push("/auth/login")
      return
    }

    const getUser = async () => {
      try {
        const response = await axios.get("http://localhost:8000/auth/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        setUser(response.data)
      } catch (err) {
        console.error("Error fetching user:", err)
        localStorage.removeItem("access_token")
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [router])

  useEffect(() => {
    if (!user) return

    const accessToken = localStorage.getItem("access_token")

    const fetchData = async () => {
      try {
        if (tab === "my-books") {
          const res = await axios.get("http://localhost:8000/books/me", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })
          setMyBooks(res.data)
        } else if (tab === "exchange-requests") {
          // Fetch incoming (received) requests
          const incomingRes = await axios.get("http://localhost:8000/exchange/incoming", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })
          const sortedReceived = incomingRes.data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setReceivedRequests(sortedReceived)
          
          // Fetch sent requests
          const sentRes = await axios.get("http://localhost:8000/exchange/my-requests", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })
          const sortedSent = sentRes.data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setSentRequests(sortedSent)
        }
      } catch (err) {
        console.error("Error fetching tab data:", err)
      }
    }

    fetchData()
  }, [tab, user])

  const fetchMyBooks = async () => {
    const accessToken = localStorage.getItem("access_token")
    const res = await fetch("http://localhost:8000/books", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    const data = await res.json()
    console.log("Books fetched:", data) // 👈 Check this
    setMyBooks(Array.isArray(data) ? data : []) // safety check
  }

  
  const closeModal = () => setIsAddBookDialogOpen(false)

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-purple-900">Dashboard</h1>
          <p className="text-gray-600">Manage your books and exchange requests</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="border-purple-300 hover:bg-purple-50"
            onClick={() => setIsAddBookDialogOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Book
          </Button>
          
          <BurgerMenu/>
        </div>
      </div>

      <Tabs defaultValue="my-books" onValueChange={(value) => setTab(value)}>
        <TabsList className="mb-4 bg-gray-100">
          <TabsTrigger value="my-books">My Books</TabsTrigger>
          <TabsTrigger value="exchange-requests">Exchange Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="my-books">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Books</CardTitle>
                <CardDescription>Books you have listed for exchange</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {myBooks?.length === 0 ? (
                <div className="rounded-md bg-amber-50 p-4">
                  <p className="text-sm font-medium text-amber-800">
                    You haven&apos;t listed any books yet. Add your first book to get started!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {myBooks?.map((book) => (
                    <div key={book.id} className="h-full flex">
                      <BookCard
                        book={book} 
                        mode="dashboard"
                        currentUser={user}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="exchange-requests">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sent Requests</CardTitle>
                <CardDescription>Exchange requests you&apos;ve sent to other users</CardDescription>
              </CardHeader>
              <CardContent>
                {sentRequests.length === 0 ? (
                  <div className="rounded-md bg-amber-50 p-4">
                    <p className="text-sm font-medium text-amber-800">
                      You haven&apos;t sent any exchange requests yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sentRequests.map((req: any) => (
                      <Card key={req.id} className="border shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">
                                {req.book?.title || `Book ID: ${req.book_id}`}
                              </p>
                              <p className="text-sm text-gray-500">
                                Status: <Badge className="ml-1">{req.status}</Badge>
                              </p>
                            </div>
                            {req.status === 'pending' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={async () => {
                                  try {
                                    const accessToken = localStorage.getItem("access_token");
                                    
                                    // First, check if you have an API endpoint to cancel a request
                                    // If not, you might need to create one
                                    await axios.delete(
                                      `http://localhost:8000/exchange/${req.id}`,
                                      {
                                        headers: {
                                          Authorization: `Bearer ${accessToken}`,
                                        },
                                      }
                                    );
                                    
                                    // Refresh the requests list
                                    const sentRes = await axios.get("http://localhost:8000/exchange/my-requests", {
                                      headers: {
                                        Authorization: `Bearer ${accessToken}`,
                                      },
                                    });
                                    setSentRequests(sentRes.data);
                                    
                                    toast.success("Request cancelled successfully!");
                                  } catch (err) {
                                    console.error("Error cancelling request:", err);
                                    toast.error("Failed to cancel request. Please try again.");
                                  }
                                }}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Received Requests</CardTitle>
                <CardDescription>Exchange requests you&apos;ve received from other users</CardDescription>
              </CardHeader>
              <CardContent>
                {receivedRequests.length === 0 ? (
                  <div className="rounded-md bg-amber-50 p-4">
                    <p className="text-sm font-medium text-amber-800">
                      You haven&apos;t received any exchange requests yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {receivedRequests.map((req: any) => (
                      <Card key={req.id} className="border shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">
                                {req.book?.title || `Book ID: ${req.book_id}`}
                              </p>
                              <p className="text-sm text-gray-500">
                                Status: <Badge className="ml-1">{req.status}</Badge>
                              </p>
                            </div>
                            {req.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  className="bg-purple-600 hover:bg-purple-700"
                                  onClick={async () => {
                                    try {
                                      const accessToken = localStorage.getItem("access_token");
                                      await axios.post(
                                        `http://localhost:8000/exchange/${req.id}/respond`,
                                        { status: "accepted" },
                                        {
                                          headers: {
                                            Authorization: `Bearer ${accessToken}`,
                                          },
                                        }
                                      );
                                      
                                      // Refresh the requests list
                                      const incomingRes = await axios.get("http://localhost:8000/exchange/incoming", {
                                        headers: {
                                          Authorization: `Bearer ${accessToken}`,
                                        },
                                      });
                                      setReceivedRequests(incomingRes.data);
                                      
                                      toast.success("Request accepted successfully!");
                                    } catch (err) {
                                      console.error("Error accepting request:", err);
                                      toast.error("Failed to accept request. Please try again.");
                                    }
                                  }}
                                >
                                  Accept
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={async () => {
                                    try {
                                      const accessToken = localStorage.getItem("access_token");
                                      await axios.post(
                                        `http://localhost:8000/exchange/${req.id}/respond`,
                                        { status: "rejected" },
                                        {
                                          headers: {
                                            Authorization: `Bearer ${accessToken}`,
                                          },
                                        }
                                      );
                                      
                                      // Refresh the requests list
                                      const incomingRes = await axios.get("http://localhost:8000/exchange/incoming", {
                                        headers: {
                                          Authorization: `Bearer ${accessToken}`,
                                        },
                                      });
                                      setReceivedRequests(incomingRes.data);
                                      
                                      toast.success("Request rejected successfully!");
                                    } catch (err) {
                                      console.error("Error rejecting request:", err);
                                      toast.error("Failed to reject request. Please try again.");
                                    }
                                  }}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Add Book Dialog */}
      <Dialog open={isAddBookDialogOpen} onOpenChange={setIsAddBookDialogOpen}>
        <DialogContent className="w-full max-w-sm sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto my-2">
          <DialogHeader>
            <DialogTitle>Add a New Book</DialogTitle>
            <DialogDescription>
              Enter the details of the book you want to share with others.
            </DialogDescription>
          </DialogHeader>
          
          <AddBookForm onSuccess={fetchMyBooks} onCancel={closeModal} />

        </DialogContent>
      </Dialog>
    </div>
  )
}