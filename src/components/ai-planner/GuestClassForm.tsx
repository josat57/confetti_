import {
  Users,
  Baby,
  User,
  UserCheck,
  Users as UsersIcon,
  Heart,
} from "lucide-react";
import {
  GuestClassData,
  AgeGroup,
  FormalityLevel,
  SocialStatus,
  SpecialRequirement,
} from "@/types/ai-planner";

interface GuestClassFormProps {
  value: GuestClassData;
  onChange: (data: GuestClassData) => void;
  errors?: {
    guestClassAgeGroups?: string;
    guestClassFormality?: string;
    guestClassSocialStatus?: string;
    guestClassAdditionalDetails?: string;
  };
}

const ageGroupOptions = [
  {
    value: AgeGroup.CHILDREN,
    label: "Children",
    icon: Baby,
    description: "Under 12",
  },
  {
    value: AgeGroup.TEENAGERS,
    label: "Teenagers",
    icon: User,
    description: "13-19",
  },
  {
    value: AgeGroup.YOUNG_ADULTS,
    label: "Young Adults",
    icon: UserCheck,
    description: "20-35",
  },
  {
    value: AgeGroup.ADULTS,
    label: "Adults",
    icon: UsersIcon,
    description: "36-60",
  },
  {
    value: AgeGroup.SENIORS,
    label: "Seniors",
    icon: Heart,
    description: "60+",
  },
];

const formalityOptions = [
  {
    value: FormalityLevel.CASUAL,
    label: "Casual",
    description: "Relaxed and informal",
  },
  {
    value: FormalityLevel.SEMI_FORMAL,
    label: "Semi-Formal",
    description: "Smart casual attire",
  },
  {
    value: FormalityLevel.FORMAL,
    label: "Formal",
    description: "Suits and dresses",
  },
  {
    value: FormalityLevel.BLACK_TIE,
    label: "Black-Tie",
    description: "Tuxedos and gowns",
  },
];

const socialStatusOptions = [
  {
    value: SocialStatus.BUDGET_CONSCIOUS,
    label: "Budget-Conscious",
    description: "Value-focused guests",
  },
  {
    value: SocialStatus.MIDDLE_CLASS,
    label: "Middle-Class",
    description: "Standard expectations",
  },
  {
    value: SocialStatus.AFFLUENT,
    label: "Affluent",
    description: "Higher expectations",
  },
  {
    value: SocialStatus.LUXURY,
    label: "Luxury",
    description: "Premium experience expected",
  },
];

const specialRequirementOptions = [
  {
    value: SpecialRequirement.DIETARY_RESTRICTIONS,
    label: "Dietary Restrictions",
    description: "Vegetarian, vegan, allergies, etc.",
  },
  {
    value: SpecialRequirement.ACCESSIBILITY_NEEDS,
    label: "Accessibility Needs",
    description: "Wheelchair access, special seating",
  },
  {
    value: SpecialRequirement.CULTURAL_CONSIDERATIONS,
    label: "Cultural Considerations",
    description: "Cultural customs and traditions",
  },
  {
    value: SpecialRequirement.RELIGIOUS_CONSIDERATIONS,
    label: "Religious Considerations",
    description: "Religious practices and requirements",
  },
];

export default function GuestClassForm({
  value,
  onChange,
  errors,
}: GuestClassFormProps) {
  const toggleAgeGroup = (ageGroup: AgeGroup) => {
    const newAgeGroups = value.ageGroups.includes(ageGroup)
      ? value.ageGroups.filter((ag) => ag !== ageGroup)
      : [...value.ageGroups, ageGroup];
    onChange({ ...value, ageGroups: newAgeGroups });
  };

  const setFormality = (formality: FormalityLevel) => {
    onChange({ ...value, formality });
  };

  const toggleSocialStatus = (status: SocialStatus) => {
    const newStatuses = value.socialStatus.includes(status)
      ? value.socialStatus.filter((s) => s !== status)
      : [...value.socialStatus, status];
    onChange({ ...value, socialStatus: newStatuses });
  };

  const toggleSpecialRequirement = (requirement: SpecialRequirement) => {
    const newRequirements = value.specialRequirements.includes(requirement)
      ? value.specialRequirements.filter((r) => r !== requirement)
      : [...value.specialRequirements, requirement];
    onChange({ ...value, specialRequirements: newRequirements });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Guest Information
        </h3>
      </div>

      {/* Age Groups */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Age Groups <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500">
          Select all age groups that will attend
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ageGroupOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = value.ageGroups.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleAgeGroup(option.value)}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    isSelected ? "bg-purple-100" : "bg-gray-100"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isSelected ? "text-purple-600" : "text-gray-600"
                    }`}
                  />
                </div>
                <div className="flex-1 text-left">
                  <p
                    className={`font-medium ${
                      isSelected ? "text-purple-900" : "text-gray-900"
                    }`}
                  >
                    {option.label}
                  </p>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </div>
                {isSelected && <span className="text-purple-600">✓</span>}
              </button>
            );
          })}
        </div>
        {errors?.guestClassAgeGroups && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <span className="text-red-500">⚠</span>
            {errors.guestClassAgeGroups}
          </p>
        )}
      </div>

      {/* Formality Level */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Formality Level <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {formalityOptions.map((option) => {
            const isSelected = value.formality === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormality(option.value)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`font-medium ${
                        isSelected ? "text-purple-900" : "text-gray-900"
                      }`}
                    >
                      {option.label}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {option.description}
                    </p>
                  </div>
                  {isSelected && (
                    <span className="text-purple-600 text-xl">●</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        {errors?.guestClassFormality && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <span className="text-red-500">⚠</span>
            {errors.guestClassFormality}
          </p>
        )}
      </div>

      {/* Social Status */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Guest Expectations <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500">
          Select all that apply to your guests
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {socialStatusOptions.map((option) => {
            const isSelected = value.socialStatus.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleSocialStatus(option.value)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`font-medium ${
                        isSelected ? "text-purple-900" : "text-gray-900"
                      }`}
                    >
                      {option.label}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {option.description}
                    </p>
                  </div>
                  {isSelected && <span className="text-purple-600">✓</span>}
                </div>
              </button>
            );
          })}
        </div>
        {errors?.guestClassSocialStatus && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <span className="text-red-500">⚠</span>
            {errors.guestClassSocialStatus}
          </p>
        )}
      </div>

      {/* Special Requirements */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Special Requirements <span className="text-gray-400">(Optional)</span>
        </label>
        <div className="space-y-2">
          {specialRequirementOptions.map((option) => {
            const isSelected = value.specialRequirements.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleSpecialRequirement(option.value)}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`font-medium text-sm ${
                        isSelected ? "text-purple-900" : "text-gray-900"
                      }`}
                    >
                      {option.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {option.description}
                    </p>
                  </div>
                  {isSelected && <span className="text-purple-600">✓</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Additional Details */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Additional Guest Details{" "}
          <span className="text-gray-400">(Optional)</span>
        </label>
        <textarea
          value={value.additionalDetails}
          onChange={(e) =>
            onChange({ ...value, additionalDetails: e.target.value })
          }
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
          placeholder="Any other important details about your guests? (e.g., cultural preferences, special needs, etc.)"
          rows={3}
          maxLength={500}
        />
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Provide any additional context about your guests
          </p>
          <span className="text-sm text-gray-400">
            {value.additionalDetails.length}/500
          </span>
        </div>
        {errors?.guestClassAdditionalDetails && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <span className="text-red-500">⚠</span>
            {errors.guestClassAdditionalDetails}
          </p>
        )}
      </div>
    </div>
  );
}
