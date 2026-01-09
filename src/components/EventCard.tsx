import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { EventDetails, EventSponsor, EventActivity } from '@/data/collaboration';

// Format date to human readable (e.g., "Friday, Jan 9, 2026")
const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

// Format time to human readable (e.g., "6:00 PM")
const formatTime = (timeStr: string): string => {
  if (!timeStr) return '';
  try {
    // Handle "HH:MM" format
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return timeStr;
  }
};

// Format activity datetime - shows just time if same date as event, otherwise shows date + time
const formatActivityTime = (timeStr: string, eventDate?: string): string => {
  if (!timeStr) return '';
  try {
    // Check if it's an ISO datetime string (contains 'T' or is longer than time-only)
    if (timeStr.includes('T') || timeStr.length > 8) {
      const activityDate = new Date(timeStr);
      
      // Get local date string (YYYY-MM-DD format) for comparison
      const activityYear = activityDate.getFullYear();
      const activityMonth = String(activityDate.getMonth() + 1).padStart(2, '0');
      const activityDay = String(activityDate.getDate()).padStart(2, '0');
      const activityDateStr = `${activityYear}-${activityMonth}-${activityDay}`;
      
      // If same as event date, just show time
      if (eventDate && activityDateStr === eventDate) {
        return activityDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
      }
      
      // Different date - show both date and time
      return activityDate.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
    
    // Simple time format (HH:MM) - assume same day as event
    return formatTime(timeStr);
  } catch {
    return timeStr;
  }
};

interface EventCardProps {
  eventDetails: EventDetails;
  collaborationId: string;
  onUpdate: (details: EventDetails) => void;
  isEditing?: boolean;
}

const Card = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.surface} 0%, ${({ theme }) => theme.background} 100%);
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 12px ${({ theme }) => theme.shadow};
  position: relative;
  overflow: hidden;

  @media (max-width: 600px) {
    padding: 1rem;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${({ theme }) => theme.accent}, #ff9a7a);
  }
`;

const CardHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
`;

const EventTag = styled.span`
  background: ${({ theme }) => theme.accent};
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: fit-content;
  margin-bottom: 0.25rem;
`;

const ContentWrapper = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const DetailsSection = styled.div`
  flex: 1;
  min-width: 200px;
`;

const FlyerSection = styled.div`
  width: 120px;
  flex-shrink: 0;

  @media (max-width: 600px) {
    width: 100%;
  }
`;

const EditableField = styled.div`
  margin-bottom: 0.5rem;
`;

const CompactEditableField = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const Label = styled.span`
  display: block;
  font-size: 0.65rem;
  color: ${({ theme }) => theme.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.15rem;
`;

const Value = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};
  padding: 0.35rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.backgroundAlt};
  }
  
  @media (max-width: 600px) {
    font-size: 0.8rem;
  }
`;

const TitleValue = styled(Value)`
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.2;
  white-space: normal;
  padding: 0.25rem;
  
  @media (max-width: 600px) {
    font-size: 1.2rem;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.35rem;
  font-size: 0.9rem;
  border: 2px solid ${({ theme }) => theme.accent};
  border-radius: 6px;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  outline: none;

  &:focus {
    box-shadow: 0 0 0 3px ${({ theme }) => theme.accent}33;
  }
`;

const TitleInput = styled(Input)`
  font-size: 1.25rem;
  font-weight: 700;
  
  @media (max-width: 600px) {
    font-size: 1.1rem;
  }
`;

const DateTimeRow = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

const DateTimeField = styled(CompactEditableField)`
  flex: 1;
  min-width: 0;
`;

const FlyerContainer = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1/1;
  border-radius: 10px;
  overflow: hidden;
  background: ${({ theme }) => theme.backgroundAlt};
  border: 2px dashed ${({ theme }) => theme.border};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.accent};
    background: ${({ theme }) => theme.surface};
  }
`;

const FlyerImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const FlyerPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.8rem;
  text-align: center;
  padding: 1rem;
`;

const UploadIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const HiddenInput = styled.input`
  display: none;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: ${({ theme }) => theme.overlay};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.9rem;
`;

const IconRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Icon = styled.span`
  font-size: 1rem;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.border};
  flex-wrap: wrap;
  gap: 1rem;
`;

const PublishButton = styled.button<{ $isPublished?: boolean }>`
  background: ${({ theme, $isPublished }) => 
    $isPublished 
      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
      : `linear-gradient(135deg, ${theme.accent} 0%, #ff9a7a 100%)`};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${({ theme }) => theme.shadow};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const PublishStatus = styled.div<{ $isPublished?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: ${({ theme, $isPublished }) => 
    $isPublished ? '#10b981' : theme.textSecondary};
`;

const StatusDot = styled.span<{ $isPublished?: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $isPublished }) => 
    $isPublished ? '#10b981' : '#9ca3af'};
`;

// Renaissance event styles
const RenaissanceSection = styled.div`
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const SectionTitle = styled.h4`
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.textSecondary};
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SponsorsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const SponsorChip = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: ${({ theme }) => theme.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.text};
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.surface};
    border-color: ${({ theme }) => theme.accent};
  }
`;

const SponsorLogo = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  object-fit: cover;
`;

const ActivitiesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ActivityCard = styled.div`
  background: ${({ theme }) => theme.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  padding: 0.875rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.accent}33;
  }
`;

const ActivityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
`;

const ActivityName = styled.span`
  font-weight: 600;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.text};
`;

const ActivityCapacity = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.textSecondary};
  background: ${({ theme }) => theme.surface};
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
`;

const ActivityMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.textSecondary};
  margin-top: 0.5rem;
`;

const ActivityMetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ActivityDescription = styled.p`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textSecondary};
  margin: 0.5rem 0 0;
  line-height: 1.4;
`;

const ActivityTime = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.accent};
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const ActivityLocation = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.textSecondary};
  margin-top: 0.25rem;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

const Tag = styled.span`
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: ${({ theme }) => theme.accent}22;
  color: ${({ theme }) => theme.accent};
  border-radius: 4px;
`;

const EventTypeTag = styled(EventTag)<{ $isRenaissance?: boolean }>`
  background: ${({ $isRenaissance }) => 
    $isRenaissance 
      ? 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)' 
      : undefined};
`;

const FlyerActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const FlyerButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;

  ${({ $variant, theme }) => $variant === 'primary' ? `
    background: linear-gradient(135deg, ${theme.accent} 0%, #ff9a7a 100%);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px ${theme.shadow};
    }
  ` : `
    background: ${theme.backgroundAlt};
    color: ${theme.text};
    border: 1px solid ${theme.border};

    &:hover:not(:disabled) {
      background: ${theme.surface};
      border-color: ${theme.accent};
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const GeneratingOverlay = styled(LoadingOverlay)`
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.8rem;
  text-align: center;
`;

const SpinnerIcon = styled.span`
  display: inline-block;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

export const EventCard: React.FC<EventCardProps> = ({
  eventDetails,
  collaborationId,
  onUpdate,
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [localDetails, setLocalDetails] = useState<EventDetails>(eventDetails);
  const [isUploading, setIsUploading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isGeneratingFlyer, setIsGeneratingFlyer] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPublished = !!localDetails.externalEventId;

  const handleFieldClick = (field: string) => {
    setEditingField(field);
  };

  const handleFieldChange = (field: keyof EventDetails, value: string) => {
    setLocalDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFieldBlur = () => {
    setEditingField(null);
    if (JSON.stringify(localDetails) !== JSON.stringify(eventDetails)) {
      onUpdate(localDetails);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFieldBlur();
    }
    if (e.key === 'Escape') {
      setLocalDetails(eventDetails);
      setEditingField(null);
    }
  };

  const handleFlyerClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];

        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file: base64,
            fileName: file.name,
            contentType: file.type,
          }),
        });

        const data = await response.json();
        if (data.success && data.url) {
          const updatedDetails = {
            ...localDetails,
            flyerUrl: data.url,
          };
          setLocalDetails(updatedDetails);
          onUpdate(updatedDetails);
        } else {
          console.error('Upload failed:', data.error);
          alert(data.error || 'Failed to upload flyer');
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading flyer:', error);
      setIsUploading(false);
      alert('Failed to upload flyer');
    }

    // Reset input
    e.target.value = '';
  };

  const handleGenerateFlyer = async () => {
    if (!localDetails.eventTitle) {
      alert('Please add an event title before generating a flyer.');
      return;
    }

    setIsGeneratingFlyer(true);
    try {
      const response = await fetch(`/api/collaboration/${collaborationId}/generate-flyer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          style: localDetails.eventType === 'renaissance' 
            ? 'elegant, sophisticated, conference-style' 
            : 'modern, vibrant, eye-catching',
        }),
      });

      const data = await response.json();
      if (data.success && data.flyerUrl) {
        const updatedDetails = {
          ...localDetails,
          flyerUrl: data.flyerUrl,
        };
        setLocalDetails(updatedDetails);
        onUpdate(updatedDetails);
      } else {
        console.error('Flyer generation failed:', data.error);
        alert(data.error || 'Failed to generate flyer');
      }
    } catch (error) {
      console.error('Error generating flyer:', error);
      alert('Failed to generate flyer');
    } finally {
      setIsGeneratingFlyer(false);
    }
  };

  const handlePublish = async () => {
    // Validate required fields
    if (!localDetails.eventTitle || !localDetails.date || !localDetails.location) {
      alert('Please fill in event name, date, and location before publishing.');
      return;
    }

    setIsPublishing(true);
    try {
      const response = await fetch(`/api/collaboration/${collaborationId}/publish-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success && data.data?.eventDetails) {
        setLocalDetails(data.data.eventDetails);
        onUpdate(data.data.eventDetails);
        alert(isPublished ? 'Event updated successfully!' : 'Event published successfully!');
      } else {
        console.error('Publish failed:', data.error);
        alert(data.error || 'Failed to publish event');
      }
    } catch (error) {
      console.error('Error publishing event:', error);
      alert('Failed to publish event');
    } finally {
      setIsPublishing(false);
    }
  };

  const renderField = (
    field: keyof EventDetails,
    label: string,
    InputComponent: typeof Input | typeof TitleInput = Input,
    ValueComponent: typeof Value | typeof TitleValue = Value,
    type: string = 'text',
    icon?: string
  ) => {
    const isEditing = editingField === field;
    const rawValue = (localDetails[field] as string) || '';
    
    // Format display value based on field type
    let displayValue = rawValue;
    if (rawValue) {
      if (type === 'date') {
        displayValue = formatDate(rawValue);
      } else if (type === 'time') {
        displayValue = formatTime(rawValue);
      }
    }

    return (
      <EditableField>
        <Label>{label}</Label>
        {isEditing ? (
          <InputComponent
            type={type}
            value={rawValue}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            onBlur={handleFieldBlur}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <ValueComponent onClick={() => handleFieldClick(field)}>
            {icon ? (
              <IconRow>
                <Icon>{icon}</Icon>
                {displayValue || `Add ${label.toLowerCase()}...`}
              </IconRow>
            ) : (
              displayValue || `Add ${label.toLowerCase()}...`
            )}
          </ValueComponent>
        )}
      </EditableField>
    );
  };

  const renderCompactField = (
    field: keyof EventDetails,
    label: string,
    type: 'date' | 'time'
  ) => {
    const isEditing = editingField === field;
    const rawValue = (localDetails[field] as string) || '';
    
    let displayValue = rawValue;
    if (rawValue) {
      if (type === 'date') {
        displayValue = formatDate(rawValue);
      } else if (type === 'time') {
        displayValue = formatTime(rawValue);
      }
    }

    return (
      <DateTimeField>
        <Label>{label}</Label>
        {isEditing ? (
          <Input
            type={type}
            value={rawValue}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            onBlur={handleFieldBlur}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <Value onClick={() => handleFieldClick(field)}>
            {displayValue || '—'}
          </Value>
        )}
      </DateTimeField>
    );
  };

  return (
    <Card>
      <CardHeader>
        <EventTypeTag $isRenaissance={localDetails.eventType === 'renaissance'}>
          {localDetails.eventType === 'renaissance' ? '✨ Renaissance' : 'Event'}
        </EventTypeTag>
        {renderField('eventTitle', 'Event Name', TitleInput, TitleValue)}
      </CardHeader>

      <ContentWrapper>
        <DetailsSection>
          <DateTimeRow>
            {renderCompactField('date', 'Date', 'date')}
            {renderCompactField('time', 'Start', 'time')}
            {renderCompactField('endTime', 'End', 'time')}
          </DateTimeRow>
          {renderField('location', 'Location', Input, Value, 'text', '📍')}
        </DetailsSection>

        <FlyerSection>
          <Label>Flyer</Label>
          <FlyerContainer onClick={!isGeneratingFlyer ? handleFlyerClick : undefined}>
            {localDetails.flyerUrl ? (
              <FlyerImage src={localDetails.flyerUrl} alt="Event flyer" />
            ) : (
              <FlyerPlaceholder>
                <UploadIcon>🖼️</UploadIcon>
                <span>No flyer yet</span>
              </FlyerPlaceholder>
            )}
            {isUploading && <LoadingOverlay>Uploading...</LoadingOverlay>}
            {isGeneratingFlyer && (
              <GeneratingOverlay>
                <SpinnerIcon>✨</SpinnerIcon>
                <span>Generating with AI...</span>
              </GeneratingOverlay>
            )}
          </FlyerContainer>
          <FlyerActions>
            <FlyerButton
              $variant="primary"
              onClick={handleGenerateFlyer}
              disabled={isGeneratingFlyer || isUploading}
              title="Generate a flyer using AI based on event details"
            >
              {isGeneratingFlyer ? (
                <>
                  <SpinnerIcon>⏳</SpinnerIcon> Generating...
                </>
              ) : (
                <>✨ Generate</>
              )}
            </FlyerButton>
            <FlyerButton
              $variant="secondary"
              onClick={handleFlyerClick}
              disabled={isGeneratingFlyer || isUploading}
              title="Upload your own flyer image"
            >
              📤 Upload
            </FlyerButton>
          </FlyerActions>
          <HiddenInput
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
          />
        </FlyerSection>
      </ContentWrapper>

      {/* Tags */}
      {localDetails.tags && localDetails.tags.length > 0 && (
        <TagsContainer>
          {localDetails.tags.map((tag, index) => (
            <Tag key={index}>{tag}</Tag>
          ))}
        </TagsContainer>
      )}

      {/* Sponsors Section (Renaissance events) */}
      {localDetails.sponsors && localDetails.sponsors.length > 0 && (
        <RenaissanceSection>
          <SectionTitle>🤝 Sponsors</SectionTitle>
          <SponsorsGrid>
            {localDetails.sponsors.map((sponsor: EventSponsor, index: number) => (
              <SponsorChip
                key={index}
                href={sponsor.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                as={sponsor.websiteUrl ? 'a' : 'span'}
              >
                {sponsor.logo && <SponsorLogo src={sponsor.logo} alt={sponsor.name} />}
                {sponsor.name}
              </SponsorChip>
            ))}
          </SponsorsGrid>
        </RenaissanceSection>
      )}

      {/* Activities Section (Renaissance events) */}
      {localDetails.activities && localDetails.activities.length > 0 && (
        <RenaissanceSection>
          <SectionTitle>📋 Schedule</SectionTitle>
          <ActivitiesList>
            {[...localDetails.activities]
              .sort((a, b) => {
                if (!a.startTime && !b.startTime) return 0;
                if (!a.startTime) return 1;
                if (!b.startTime) return -1;
                return a.startTime.localeCompare(b.startTime);
              })
              .map((activity: EventActivity, index: number) => {
              const hasDifferentLocation = activity.location && activity.location !== localDetails.location;
              return (
                <ActivityCard key={index}>
                  {activity.startTime && (
                    <ActivityTime>
                      🕐 {formatActivityTime(activity.startTime, localDetails.date)}
                      {activity.endTime && ` - ${formatActivityTime(activity.endTime, localDetails.date)}`}
                    </ActivityTime>
                  )}
                  <ActivityHeader>
                    <ActivityName>{activity.name}</ActivityName>
                    {activity.capacity && (
                      <ActivityCapacity>👥 {activity.capacity} max</ActivityCapacity>
                    )}
                  </ActivityHeader>
                  {hasDifferentLocation && (
                    <ActivityLocation>📍 {activity.location}</ActivityLocation>
                  )}
                  {activity.description && (
                    <ActivityDescription>{activity.description}</ActivityDescription>
                  )}
                </ActivityCard>
              );
            })}
          </ActivitiesList>
        </RenaissanceSection>
      )}

      {/* Metadata (Renaissance events) */}
      {localDetails.metadata && Object.keys(localDetails.metadata).length > 0 && (
        <RenaissanceSection>
          <SectionTitle>ℹ️ Details</SectionTitle>
          <ActivityMeta>
            {Object.entries(localDetails.metadata).map(([key, value]) => (
              <ActivityMetaItem key={key}>
                <strong style={{ textTransform: 'capitalize' }}>{key}:</strong> {String(value)}
              </ActivityMetaItem>
            ))}
          </ActivityMeta>
        </RenaissanceSection>
      )}

      <CardFooter>
        <PublishStatus $isPublished={isPublished}>
          <StatusDot $isPublished={isPublished} />
          {isPublished ? (
            <>
              Published
              {localDetails.publishedAt && (
                <span style={{ opacity: 0.7 }}>
                  · {new Date(localDetails.publishedAt).toLocaleDateString()}
                </span>
              )}
            </>
          ) : (
            'Not published'
          )}
        </PublishStatus>
        <PublishButton
          onClick={handlePublish}
          disabled={isPublishing}
          $isPublished={isPublished}
        >
          {isPublishing ? (
            'Publishing...'
          ) : isPublished ? (
            <>🔄 Update Event</>
          ) : (
            <>🚀 Publish Event</>
          )}
        </PublishButton>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
