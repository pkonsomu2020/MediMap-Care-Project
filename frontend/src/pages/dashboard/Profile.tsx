import { Mail, Phone, Edit2, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type User = {
  user_id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
};

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bloodType: "",
    allergies: "",
    conditions: "",
    emergencyName: "",
    emergencyRelation: "",
    emergencyPhone: "",
  });

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const userData = await api.getCurrentUser();
        setUser(userData);
        setFormData({
          name: userData.name,
          email: userData.email,
          phone: userData.phone || "",
          bloodType: userData.bloodType || "",
          allergies: userData.allergies || "",
          conditions: userData.conditions || "",
          emergencyName: userData.emergencyName || "",
          emergencyRelation: userData.emergencyRelation || "",
          emergencyPhone: userData.emergencyPhone || "",
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load profile";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    loadUserProfile();
  }, []);

  const handleSave = async () => {
    try {
      // Example: send updated profile data to backend
      await api.updateUserProfile(formData);
      setIsEditing(false);
      if (user) {
        setUser({
          ...user,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update profile";
      setError(errorMessage);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        bloodType: user.bloodType || "",
        allergies: user.allergies || "",
        conditions: user.conditions || "",
        emergencyName: user.emergencyName || "",
        emergencyRelation: user.emergencyRelation || "",
        emergencyPhone: user.emergencyPhone || "",
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-full bg-muted/20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mr-4" />
        <span>Loading profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-muted/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-full bg-muted/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No user data found</p>
          <Button onClick={() => window.location.reload()}>Reload</Button>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-full bg-muted/20">
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-card rounded-xl p-8 shadow-soft border border-border">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-3xl font-semibold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 shadow-medium hover:shadow-glow transition-all">
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
                <p className="text-muted-foreground mb-4">
                  Patient ID: #{user.user_id}
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-primary" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Personal Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className="pl-10"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        className="pl-10"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="pt-6 border-t border-border">
                <h3 className="text-lg font-semibold mb-4">
                  Medical Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bloodType">Blood Type</Label>
                    <Input
                      id="bloodType"
                      placeholder="Not specified"
                      value={formData.bloodType}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          bloodType: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="allergies">Allergies</Label>
                    <Input
                      id="allergies"
                      placeholder="None"
                      value={formData.allergies}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          allergies: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="conditions">Medical Conditions</Label>
                    <Textarea
                      id="conditions"
                      placeholder="No medical conditions specified"
                      rows={3}
                      value={formData.conditions}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          conditions: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="pt-6 border-t border-border">
                <h3 className="text-lg font-semibold mb-4">
                  Emergency Contact
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyName">Contact Name</Label>
                    <Input
                      id="emergencyName"
                      placeholder="Not specified"
                      value={formData.emergencyName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          emergencyName: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyRelation">Relationship</Label>
                    <Input
                      id="emergencyRelation"
                      placeholder="Not specified"
                      value={formData.emergencyRelation}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          emergencyRelation: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="emergencyPhone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="emergencyPhone"
                        type="tel"
                        placeholder="Not specified"
                        className="pl-10"
                        value={formData.emergencyPhone}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            emergencyPhone: e.target.value,
                          }))
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6">
                {isEditing ? (
                  <>
                    <Button variant="hero" onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
