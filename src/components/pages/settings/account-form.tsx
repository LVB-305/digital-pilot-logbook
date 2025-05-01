import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client/client";
import { logout } from "@/actions/auth/logout";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PasswordDialog } from "@/components/pages/settings/new-password-overlay";
import Field from "@/components/pages/settings/field";
import { Edit, Plus } from "lucide-react";

export function AccountForm() {
  const supabase = createClient();
  const [authProvider, setAuthProvider] = useState<string | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Fetch user data when component mounts
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      setAuthProvider(user?.app_metadata?.provider || null);
    };
    getUser();
  }, []);

  const handleUpdateField = async (field: string, value: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (field === "email") {
      const { error } = await supabase.auth.updateUser({ email: value });
      if (error) throw error;
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ [field]: value })
      .eq("id", user.id);

    if (error) throw error;
  };

  const handleLogout = async () => {
    try {
      // Server-side signout and get redirect info
      const data = await logout();
      // Use the redirect URL from server action
      if (data?.redirectTo) {
        window.location.href = data.redirectTo;
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Personal Information</h2>
      <Separator className="mb-6" />

      {/* Personal information fields */}
      <div className="space-y-6 mb-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Profile Picture</Label>
          <div className="flex items-center space-x-2">
            <div className="relative group cursor-pointer">
              <Input
                type="file"
                className="hidden"
                id="avatar-upload"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  try {
                    const {
                      data: { user },
                    } = await supabase.auth.getUser();
                    if (!user) return;

                    // Upload to storage
                    const fileExt = file.name.split(".").pop();
                    const fileName = `${user.id}.${fileExt}`;
                    const { error: uploadError } = await supabase.storage
                      .from("avatars")
                      .upload(fileName, file, { upsert: true });

                    if (uploadError) throw uploadError;

                    // Get public URL
                    const {
                      data: { publicUrl },
                    } = supabase.storage.from("avatars").getPublicUrl(fileName);

                    // Update user
                    const { error: updateError } =
                      await supabase.auth.updateUser({
                        data: { avatar_url: publicUrl },
                      });

                    if (updateError) throw updateError;
                  } catch (error) {
                    console.error("Error uploading avatar:", error);
                  }
                }}
              />
              <Avatar
                className="h-14 w-14"
                onClick={() =>
                  document.getElementById("avatar-upload")?.click()
                }
              >
                <AvatarFallback className="text-xs">
                  {user?.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Plus size={16} />
                  )}
                </AvatarFallback>
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <Edit className="h-4 w-4 text-white" />
                </div>
              </Avatar>
            </div>
          </div>
        </div>
        <Field label="Email" dbField="email" onUpdate={handleUpdateField} />
        <Field label="Phone" dbField="phone" onUpdate={handleUpdateField} />
        <Field label="Company" dbField="company" onUpdate={handleUpdateField} />
        <Field
          label="Company ID"
          dbField="company_id"
          onUpdate={handleUpdateField}
        />
        <Field label="Address" dbField="address" onUpdate={handleUpdateField} />
        <Field
          label="License Number"
          dbField="license_number"
          onUpdate={handleUpdateField}
        />

        <h2 className="text-lg font-semibold mb-2">Account Security</h2>
        <Separator className="mb-6" />

        <div className="space-y-6 mb-4">
          {authProvider === "email" && (
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Password</Label>
                <p className="text-sm text-muted-foreground">
                  Choose a new password for your account.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPasswordDialogOpen(true)}
              >
                Change Password
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">
                2-Step Verifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Add an additional layer of security to your account during
                login.
              </p>
            </div>
            <Switch checked={false} onCheckedChange={() => {}} />
          </div>
        </div>
        <Separator className="mb-6" />

        {/* Delete account */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Logout</Label>
              <p className="text-sm text-muted-foreground">
                Log out of your account on this device.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => handleLogout()}>
              Log Out
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium text-destructive">
                Delete my account
              </Label>
              <p className="text-sm text-muted-foreground">
                Permanently delete the account and remove access from all
                devices.
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Delete Account
            </Button>
          </div>
        </div>

        <PasswordDialog
          isOpen={isPasswordDialogOpen}
          onClose={() => setIsPasswordDialogOpen(false)}
        />
      </div>
    </div>
  );
}
