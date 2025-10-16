import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Save, Edit2, Loader2, FileText, Search, X } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

import insuranceData from "../../components/data/Insurance_info.json";

// Define the form data structure
interface InsuranceFormData {
  insuranceCompany: string;
  planCategory: string;
  planType: string;
  memberId: string;
  groupNumber: string;
  payerFullName: string;
  payerPhoneNumber: string;
  payerSubmissionAddress: string;
  notes: string;
}

const InsuranceForm = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Initial empty form state
  const initialFormState: InsuranceFormData = {
    insuranceCompany: "",
    planCategory: "",
    planType: "",
    memberId: "",
    groupNumber: "",
    payerFullName: "",
    payerPhoneNumber: "",
    payerSubmissionAddress: "",
    notes: "",
  };

  const [formData, setFormData] = useState<InsuranceFormData>(initialFormState);
  const [originalForm, setOriginalForm] = useState<InsuranceFormData>(initialFormState);

  // Load initial data when component mounts (you can replace this with an API call)
  useEffect(() => {
    // In a real app, you would fetch this data from an API
    // For now, we'll initialize with the initial state
    setOriginalForm(initialFormState);
    setFormData(initialFormState);
  }, []);

  const handleChange = (key: string, value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setIsEditing(false);
      // Update original form to current saved state
      setOriginalForm(formData);
    }, 1000);
  };

  const handleCancel = () => {
    // Revert form data to original state
    setFormData(originalForm);
    setIsEditing(false);
    setSearchQuery("");
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  // Filter insurance companies based on search query
  const filteredInsuranceCompanies = insuranceData.filter((ins) =>
    ins.Payer_ID.Insurance_Company_Name.toLowerCase().includes(
      searchQuery.toLowerCase()
    )
  );

  // Find selected insurer in the JSON
  const selectedInsurer = insuranceData.find(
    (ins) =>
      ins.Payer_ID.Insurance_Company_Name === formData.insuranceCompany
  );

  // Extract dropdown data dynamically
  const coverageCategories = selectedInsurer
    ? [selectedInsurer.Coverage.Primary_Coverage_Category]
    : [];

  const planTypes = selectedInsurer
    ? selectedInsurer.Coverage.Plan_Type_General.split(",").map((t) => t.trim())
    : [];

  const authRule = selectedInsurer
    ? selectedInsurer.Coverage.Prior_Authorization_Required_Rule
    : "";

  const insurerSelected =
    formData.insuranceCompany && formData.insuranceCompany !== "Don't have";

  // Check if form has been modified
  const isFormModified = JSON.stringify(formData) !== JSON.stringify(originalForm);

  return (
    <div className="min-h-full bg-muted/20">
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <FileText className="h-7 w-7 text-primary" />
            Insurance Information
          </h1>
          <p className="text-muted-foreground">
            Manage your insurance coverage and payer details
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-card rounded-xl p-8 shadow-soft border border-border space-y-8">
            {/* Company & Plan Info */}
            <section>
              <h3 className="text-lg font-semibold mb-4">
                Insurance Details
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Insurance Company - Searchable Select */}
                <div className="space-y-2 md:col-span-2">
                  <Label>Insurance Company Name</Label>
                  <Select
                    value={formData.insuranceCompany}
                    onValueChange={(v) => {
                      handleChange("insuranceCompany", v);
                      handleChange("planCategory", "");
                      handleChange("planType", "");
                      setSearchQuery(""); // Clear search when selection is made
                    }}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2 border-b">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search insurance companies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <div className="max-h-60 overflow-auto">
                        <SelectItem value="Don't have">Don't have</SelectItem>
                        {filteredInsuranceCompanies.map((ins) => (
                          <SelectItem
                            key={ins.Payer_ID.Insurance_Company_Name}
                            value={ins.Payer_ID.Insurance_Company_Name}
                          >
                            {ins.Payer_ID.Insurance_Company_Name}
                          </SelectItem>
                        ))}
                        {filteredInsuranceCompanies.length === 0 && (
                          <div className="py-2 px-2 text-sm text-muted-foreground text-center">
                            No insurance companies found
                          </div>
                        )}
                      </div>
                    </SelectContent>
                  </Select>
                </div>

                {/* Plan Category */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-2">
                        <Label>Coverage Category</Label>
                        <Select
                          value={formData.planCategory}
                          onValueChange={(v) => handleChange("planCategory", v)}
                          disabled={!isEditing || !insurerSelected}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {coverageCategories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TooltipTrigger>
                    {!insurerSelected && isEditing && (
                      <TooltipContent>
                        Select an insurance company first
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>

                {/* Plan Type */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="space-y-2">
                        <Label>Plan Type</Label>
                        <Select
                          value={formData.planType}
                          onValueChange={(v) => handleChange("planType", v)}
                          disabled={
                            !isEditing ||
                            !insurerSelected ||
                            !formData.planCategory
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select plan type" />
                          </SelectTrigger>
                          <SelectContent>
                            {planTypes.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TooltipTrigger>
                    {!insurerSelected && isEditing && (
                      <TooltipContent>
                        Select an insurance company first
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>

                {/* Member ID */}
                <div className="space-y-2">
                  <Label>Member ID</Label>
                  <Input
                    value={formData.memberId}
                    onChange={(e) =>
                      handleChange("memberId", e.target.value)
                    }
                    disabled={!isEditing}
                    placeholder="e.g., ABC12345"
                  />
                </div>

                {/* Group Number */}
                <div className="space-y-2">
                  <Label>Group Number</Label>
                  <Input
                    value={formData.groupNumber}
                    onChange={(e) =>
                      handleChange("groupNumber", e.target.value)
                    }
                    disabled={!isEditing}
                    placeholder="e.g., EMP98765"
                  />
                </div>
              </div>
            </section>

            {/* Payer Information */}
            <section>
              <h3 className="text-lg font-semibold mb-4">Payer Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Payer Full Name */}
                <div className="space-y-2">
                  <Label>Payer Full Name</Label>
                  <Input
                    value={formData.payerFullName}
                    onChange={(e) =>
                      handleChange("payerFullName", e.target.value)
                    }
                    disabled={!isEditing}
                    placeholder="Full name of insurance provider"
                  />
                </div>

                {/* Payer Phone Number */}
                <div className="space-y-2">
                  <Label>Payer Phone Number</Label>
                  <Input
                    value={formData.payerPhoneNumber}
                    onChange={(e) =>
                      handleChange("payerPhoneNumber", e.target.value)
                    }
                    disabled={!isEditing}
                    placeholder="e.g. +254 700 000 000"
                  />
                </div>

                {/* Payer Submission Address */}
                <div className="space-y-2 md:col-span-2">
                  <Label>Payer Submission Address</Label>
                  <Textarea
                    rows={2}
                    value={formData.payerSubmissionAddress}
                    onChange={(e) =>
                      handleChange("payerSubmissionAddress", e.target.value)
                    }
                    disabled={!isEditing}
                    placeholder="Full address for claim submissions"
                  />
                </div>
              </div>
            </section>

            {/* Notes */}
            <section>
              <h3 className="text-lg font-semibold mb-4">Notes</h3>
              <Textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                disabled={!isEditing}
                placeholder="Additional remarks or internal notes..."
              />
            </section>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-border">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} disabled={loading || !isFormModified}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Info
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleEdit}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Info
                </Button>
              )}
            </div>

            {/* Modification indicator */}
            {isEditing && isFormModified && (
              <div className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-md border border-amber-200">
                You have unsaved changes
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsuranceForm;