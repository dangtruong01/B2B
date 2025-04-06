"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { CheckIcon, Pencil, User, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import BurgerMenu from "@/components/BurgerMenu";

// Available genres for book preferences
const bookGenres = [
  "Fiction", 
  "Non-Fiction", 
  "Mystery", 
  "Science Fiction", 
  "Fantasy", 
  "Romance", 
  "Thriller", 
  "Horror", 
  "Biography", 
  "History", 
  "Self-Help", 
  "Business", 
  "Children's", 
  "Young Adult",
  "Comics & Graphic Novels",
  "Poetry",
  "Other"
];

// Form schema
const profileFormSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  display_name: z.string().optional(),
  bio: z.string().max(500, {
    message: "Bio must not exceed 500 characters.",
  }).optional(),
  location: z.string().optional(),
  favorite_genres: z.array(z.string()).optional(),
  profile_photo: z.any().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Set up form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      display_name: "",
      bio: "",
      location: "",
      favorite_genres: [],
    },
  });

  // Update your useEffect to include profile photo handling:
useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      router.push("/auth/login");
      return;
    }
  
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Get the current user info
        const userResponse = await axios.get("http://localhost:8000/auth/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
  
        // Get the user profile
        const profileResponse = await axios.get("http://localhost:8000/profile/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
  
        const userData = userResponse.data;
        const profileData = profileResponse.data;
        
        // Combine auth user and profile data
        const combinedUser = {
          ...userData,
          ...profileData,
        };
        
        setUser(combinedUser);
        
        // Set profile photo URL if it exists
        if (profileData.profile_photo_url) {
          setProfilePhotoUrl(profileData.profile_photo_url);
        }
        
        // Set form default values
        form.reset({
          username: profileData.username || userData.email,
          display_name: profileData.display_name || "",
          bio: profileData.bio || "",
          location: profileData.location || "",
          favorite_genres: profileData.favorite_genres || [],
        });
        
        // Update selected genres
        setSelectedGenres(profileData.favorite_genres || []);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserData();
  }, [router, form]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/auth/login");
  };

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        router.push("/auth/login");
        return;
      }
      
      // Include selected genres in the form values
      values.favorite_genres = selectedGenres;
      
      // Update profile with regular data (no files)
      const updateData = {
        username: values.username,
        display_name: values.display_name || null,
        bio: values.bio || null,
        location: values.location || null,
        favorite_genres: values.favorite_genres
      };
      
      // Update profile
      await axios.patch(
        "http://localhost:8000/profile/me",
        updateData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      // Update user state with new values
      setUser({
        ...user,
        ...values,
      });
      
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prevSelected) =>
      prevSelected.includes(genre)
        ? prevSelected.filter((g) => g !== genre)
        : [...prevSelected, genre]
    );
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Add this function to handle photo uploads
const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    try {
      setUploadingPhoto(true);
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        router.push("/auth/login");
        return;
      }
  
      // Create a temporary local URL for immediate display
      const localUrl = URL.createObjectURL(file);
      setProfilePhotoUrl(localUrl);
  
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("profile_photo", file);
  
      // Upload the profile photo
      toast.promise(
        axios.post(
          "http://localhost:8000/profile/upload-photo",
          formData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "multipart/form-data",
            },
          }
        ),
        {
          loading: 'Uploading photo...',
          success: (response) => {
            // Update the profile photo URL with the one from server
            setProfilePhotoUrl(response.data.profile_photo_url);
            
            // Update the user state
            setUser({
              ...user,
              profile_photo_url: response.data.profile_photo_url,
            });
            
            return 'Profile photo uploaded successfully!';
          },
          error: (error) => {
            // Revert to previous photo if there was one
            setProfilePhotoUrl(user?.profile_photo_url || "");
            console.error("Error details:", error.response?.data);
            return `Upload failed: ${error.response?.data?.detail || error.message || "Unknown error"}`;
          },
        }
      );
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      setProfilePhotoUrl(user?.profile_photo_url || "");
      toast.error("Failed to upload profile photo");
    } finally {
      setUploadingPhoto(false);
    }
  };
  
  // Add this function to trigger the file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-purple-900">My Profile</h1>
          <p className="text-gray-600">Manage your personal information and preferences</p>
        </div>
        <BurgerMenu onLogout={handleLogout} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Info Card */}
        <Card className="md:col-span-1">
          <CardHeader className="flex flex-col items-center space-y-2">
          <div className="relative">
            <Avatar className="h-24 w-24">
                <AvatarImage src={profilePhotoUrl} />
                <AvatarFallback className="bg-purple-100 text-purple-800 text-xl">
                {user && getInitials(user.display_name || user.username || user.email)}
                </AvatarFallback>
            </Avatar>
            {isEditing && (
                <div 
                className="absolute bottom-0 right-0 bg-purple-600 rounded-full p-1 cursor-pointer"
                onClick={triggerFileInput}
                >
                <Upload className="h-4 w-4 text-white" />
                <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/*" 
                    onChange={handlePhotoUpload}
                />
                </div>
            )}
          </div>
            <div className="text-center">
              <CardTitle>
                {user?.display_name || user?.username || user?.email}
              </CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancel Editing" : "Edit Profile"}
              {!isEditing && <Pencil className="ml-2 h-4 w-4" />}
            </Button>
          </CardContent>
        </Card>

        {/* Profile Form Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your profile information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="info">Basic Info</TabsTrigger>
                <TabsTrigger value="preferences">Reading Preferences</TabsTrigger>
              </TabsList>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <TabsContent value="info" className="space-y-4">
                    {/* Username Field */}
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              disabled={!isEditing} 
                              placeholder="Enter username" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Display Name Field */}
                    <FormField
                      control={form.control}
                      name="display_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Name</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              disabled={!isEditing} 
                              value={field.value || ""} 
                              placeholder="Enter display name" 
                            />
                          </FormControl>
                          <FormDescription>
                            This is the name that will be displayed to other users.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Location Field */}
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              disabled={!isEditing} 
                              value={field.value || ""} 
                              placeholder="Enter your location" 
                            />
                          </FormControl>
                          <FormDescription>
                            This helps match you with nearby book exchanges.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Bio Field */}
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              disabled={!isEditing} 
                              value={field.value || ""} 
                              placeholder="Tell others about yourself..." 
                              className="min-h-[100px] resize-none"
                            />
                          </FormControl>
                          <FormDescription>
                            Share a little about yourself and your reading interests.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  <TabsContent value="preferences">
                    <div className="space-y-4">
                      <div>
                        <Label>Favorite Genres</Label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {bookGenres.map((genre) => (
                            <Badge
                              key={genre}
                              variant="outline"
                              className={`cursor-pointer py-1.5 ${
                                selectedGenres.includes(genre)
                                  ? "bg-purple-100 text-purple-800 border-purple-300"
                                  : ""
                              }`}
                              onClick={() => isEditing && toggleGenre(genre)}
                            >
                              {selectedGenres.includes(genre) && (
                                <CheckIcon className="mr-1 h-3 w-3" />
                              )}
                              {genre}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          {isEditing ? "Click on the genres you enjoy reading." : ""}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {isEditing && (
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Save Changes
                      </Button>
                    </div>
                  )}
                </form>
              </Form>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}