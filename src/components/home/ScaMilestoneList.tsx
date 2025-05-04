import { useCallback, useEffect, useMemo, useState } from "react";
import type { Schema } from "../../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Table,
  Box,
  SpaceBetween,
  Button,
  TextFilter,
  Header,
  Pagination,
  CollectionPreferences,
  ButtonDropdown,
  Modal,
  Input,
  SegmentedControl
} from "@cloudscape-design/components";

const client = generateClient<Schema>();

interface Preferences {
  pageSize: number;
  contentDisplay: Array<{ id: string; visible: boolean }>;
}

const initialPreferences: Preferences = {
  pageSize: 10,
  contentDisplay: [
    { id: "milestone_type", visible: true },
    { id: "milestone_description", visible: true },
    { id: "status", visible: true },
    { id: "is_tech", visible: true },
    { id: "milestone_date", visible: true },
    { id: "milestone_goal", visible: true }
  ]
};

const DeleteConfirmationModal = ({ 
    visible, 
    selectedCount, 
    onConfirm, 
    onDismiss, 
    confirmationText, 
    onConfirmationTextChange 
}: {
    visible: boolean;
    selectedCount: number;
    onConfirm: () => void;
    onDismiss: () => void;
    confirmationText: string;
    onConfirmationTextChange: (value: string) => void;
}) => (
    <Modal
        visible={visible}
        onDismiss={onDismiss}
        header="Confirm Deletion"
        closeAriaLabel="Close dialog"
        footer={
            <Box float="right">
                <SpaceBetween direction="horizontal" size="xs">
                    <Button variant="link" onClick={onDismiss}>Cancel</Button>
                    <Button
                        variant="primary"
                        onClick={onConfirm}
                        disabled={confirmationText.toLowerCase() !== 'delete'}
                    >
                        Delete
                    </Button>
                </SpaceBetween>
            </Box>
        }
    >
        <SpaceBetween size="m">
            <Box>
                Are you sure you want to delete {selectedCount} selected item(s)?
                Type 'delete' to confirm.
            </Box>
            <Input
                value={confirmationText}
                onChange={({ detail }) => onConfirmationTextChange(detail.value)}
                placeholder="Type 'delete' to confirm"
            />
        </SpaceBetween>
    </Modal>
);

const styles = {
  milestoneColumn: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%' 
  }
} as const; // Using 'as const' to make it readonly

function ScaMilestoneList() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [sca, setSca] = useState<Schema["Sca"]["type"] | null>(null);
  const [milestones, setMilestones] = useState<Array<Schema["Milestone"]["type"]>>([]);
  const [selectedItems, setSelectedItems] = useState<Array<Schema["Milestone"]["type"]>>([]);
  const [filteringText, setFilteringText] = useState("");
  const [filteredItems, setFilteredItems] = useState<Array<Schema["Milestone"]["type"]>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [preferences, setPreferences] = useState<Preferences>(initialPreferences);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [pagesCount, setPagesCount] = useState(1);
  const [filterType, setFilterType] = useState<'all' | 'tech' | 'biz'>('all');
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    
    // Check if the date is already in MM/DD/YY format
    const mmddyyRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[1])\/(19|20)?\d{2}$/;
    if (mmddyyRegex.test(dateString)) {
      // If it's already in correct format, return as is
      return dateString;
    }
  
    // If not in MM/DD/YY format, return the original string
    return dateString;
  };
  
  // Add the helper function here
  // Helper function to parse date strings into Date objects for comparison
  const parseDate = useCallback((dateString: string | null | undefined): Date | null => {
    if (!dateString) return null;
    
    // Check if the date is in MM/DD/YY format
    const mmddyyRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[1])\/(19|20)?\d{2}$/;
    if (mmddyyRegex.test(dateString)) {
      const [month, day, year] = dateString.split('/');
      // Convert YY to YYYY if needed
      let fullYear = year;
      if (year.length === 2) {
        fullYear = parseInt(year) > 50 ? `19${year}` : `20${year}`;
      }
      return new Date(`${fullYear}-${month}-${day}`);
    }
    
    // Try to parse as ISO date
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }, []);
  
// Then, wrap sortMilestones in useCallback with parseDate as a dependency
const sortMilestones = useCallback((milestones: Schema["Milestone"]["type"][]) => {
  return [...milestones].sort((a, b) => {
    // First sort by target date
    const dateA = parseDate(a.targeted_date);
    const dateB = parseDate(b.targeted_date);
    
    if (dateA && dateB) {
      return dateA.getTime() - dateB.getTime(); // Ascending order (oldest first)
    } else if (dateA) {
      return -1; // a has date, b doesn't
    } else if (dateB) {
      return 1;  // b has date, a doesn't
    }

    // If dates are equal or both null, sort by milestone type
    if (a.milestone_type && b.milestone_type) {
      const typeCompare = a.milestone_type.localeCompare(b.milestone_type);
      if (typeCompare !== 0) return typeCompare;
    } else if (a.milestone_type) {
      return -1;
    } else if (b.milestone_type) {
      return 1;
    }

    // If types are equal, sort by description
    if (a.milestone_description && b.milestone_description) {
      return a.milestone_description.localeCompare(b.milestone_description);
    } else if (a.milestone_description) {
      return -1;
    } else if (b.milestone_description) {
      return 1;
    }

    return 0;
  });
}, [parseDate]); // Add parseDate as a dependency

// Helper function to render status indicator (RAG status or Not Baselined warning)
const renderStatusIndicator = useCallback((item: Schema["Milestone"]["type"]) => {
  if (!item.is_baselined) {
    return (
      <span style={{ 
        display: 'inline-flex', 
        alignItems: 'center',
        color: '#FF9900' // Warning color (amber)
      }}>
        <span style={{ 
          backgroundColor: '#FF9900', // Warning color (amber)
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          display: 'inline-block',
          marginRight: '4px'
        }} />
        <span>Not Baselined</span>
      </span>
    );
  }
  
  // If baselined but no RAG status, return null
  if (!item.calc_rag_type) return null;
  
  // Determine color based on RAG status
  let statusColor;
  switch (item.calc_rag_type.toLowerCase()) {
    case 'red':
      statusColor = '#D13212'; // Red
      break;
    case 'amber':
      statusColor = '#FF9900'; // Amber/Yellow
      break;
    case 'green':
      statusColor = '#1D8102'; // Green
      break;
    default:
      statusColor = '#5F6B7A'; // Default gray
  }
  
  // Check if isOverride is true (handle different possible types)
  const showOverride = item.is_rag_override === true
  
  return (
    <span style={{ 
      display: 'inline-flex', 
      alignItems: 'center' 
    }}>
      <span style={{ 
        backgroundColor: statusColor,
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        display: 'inline-block',
        marginRight: '4px'
      }} />
      <span>
        {item.calc_rag_type}
        {showOverride && <span style={{ fontStyle: 'italic', marginLeft: '4px' }}>(Override)</span>}
      </span>
    </span>
  );
}, []);


  // Navigation check
  useEffect(() => {
    if (!location.state?.sca) {
      navigate('/scadetail');
      return;
    }

    const { sca, milestones } = location.state;
    setSca(sca);
    setMilestones(milestones || []);
    setFilteredItems(milestones || []);
  }, [location.state, navigate]);

// Update your filtering logic to maintain sort order
// Update your filtering logic to maintain sort order and apply type filter
const handleFiltering = useCallback((text: string = '', type: 'all' | 'tech' | 'biz' = filterType) => {
  setFilteringText(text);
  
  // First filter by text
  let filtered = text ? milestones.filter(item => 
    (item.milestone_type?.toLowerCase() || '').includes(text.toLowerCase()) ||
    (item.milestone_description?.toLowerCase() || '').includes(text.toLowerCase())
  ) : milestones;
  
  // Then apply type filter
  if (type === 'tech') {
    filtered = filtered.filter(item => item.is_tech === true);
  } else if (type === 'biz') {
    filtered = filtered.filter(item => item.is_tech === false);
  }
  
  setFilteredItems(sortMilestones(filtered));  // Apply sorting to filtered results
}, [milestones, sortMilestones, filterType]);

// Handle filter type change
const handleFilterTypeChange = useCallback((type: 'all' | 'tech' | 'biz') => {
  setFilterType(type);
  handleFiltering(filteringText, type);
}, [filteringText, handleFiltering]);

// Custom filter component with text filter and radio buttons
const CustomFilter = () => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <div style={{ marginRight: '16px' }}>
      <SegmentedControl
        selectedId={filterType}
        onChange={({ detail }) => handleFilterTypeChange(detail.selectedId as 'all' | 'tech' | 'biz')}
        label="Filter by type"
        options={[
          { id: 'all', text: 'Tech+Biz' },
          { id: 'tech', text: 'Tech' },
          { id: 'biz', text: 'Biz' }
        ]}
      />
    </div>
    <div style={{ width: '50%' }}>
      <TextFilter
        filteringPlaceholder="Find Milestone"
        filteringText={filteringText}
        onChange={({ detail }) => handleFiltering(detail.filteringText)}
        countText={`${filteredItems.length} matches`}
      />
    </div>
  </div>
);

// Calculate pagination
const calculatePagination = useCallback(() => {
  const pageSize = preferences.pageSize;
  const totalItems = filteredItems.length;
  const calculatedPagesCount = Math.ceil(totalItems / pageSize);
  setPagesCount(calculatedPagesCount || 1); // Ensure at least 1 page even when empty
  // If current page is beyond the new page count, reset to page 1
  if (currentPageIndex > calculatedPagesCount && calculatedPagesCount > 0) {
    setCurrentPageIndex(1);
  }
}, [filteredItems.length, preferences.pageSize, currentPageIndex]);

// Get current page items
const getCurrentPageItems = useCallback(() => {
  const startIndex = (currentPageIndex - 1) * preferences.pageSize;
  const endIndex = startIndex + preferences.pageSize;
  return filteredItems.slice(startIndex, endIndex);
}, [filteredItems, currentPageIndex, preferences.pageSize]);

// Add this after your other useEffect hooks
useEffect(() => {
  calculatePagination();
}, [filteredItems, preferences.pageSize, calculatePagination]);

// Milestone click handler
const handleMilestoneClick = useCallback((item: Schema["Milestone"]["type"]) => {
  navigate('/milestoneupdateform', { 
    state: { 
      item: JSON.parse(JSON.stringify(item)),
      sca: sca  // Pass the sca data as well since it's needed in the form
    } 
  });
}, [navigate, sca]);


  // Delete handling
  const handleDeleteMilestones = async () => {
    if (deleteConfirmationText.toLowerCase() !== 'delete') return;
    
    try {
      await Promise.all(
        selectedItems.map(item => client.models.Milestone.delete(item))
      );
      setSelectedItems([]);
      setShowDeleteModal(false);
      setDeleteConfirmationText('');
    } catch (error) {
      console.error('Error deleting Milestones:', error);
    }
  };

  // Action handling
  const handleActionClick = ({ detail }: { detail: { id: string } }) => {
    const actions: Record<string, () => void> = {
      delete: () => setShowDeleteModal(true),
      return: () => navigate(-1)
    };
    actions[detail.id]?.();
  };

  // Column definitions
const columnDefinitions = useMemo(() => [
  {
    id: "milestone_type",
    header: "Type",
    cell: (item: Schema["Milestone"]["type"]) => item.milestone_type,
    width: 70 // Add specific width
  },
  {
    id: "milestone_description",
    header: "Milestone",
    cell: (item: Schema["Milestone"]["type"]) => (
      <div 
        style={{
          ...styles.milestoneColumn,
          paddingLeft: 0, // Remove any left padding
          cursor: 'pointer',
          color: '#0073bb', // Link color
          textDecoration: 'none'
        }} 
        title={item.milestone_description || ''}
        onClick={() => handleMilestoneClick(item)}
      >
        {item.milestone_description}
      </div>
    ),
    width: 'auto',
    minWidth: 350, // Reduced since we're moving status to its own column
    maxWidth: 450
  },
  {
    id: "status",
    header: "Status",
    cell: (item: Schema["Milestone"]["type"]) => renderStatusIndicator(item),
    width: 120 // Width for the status column
  },
  {
    id: "is_tech",
    header: "Is Tech?",
    cell: (item: Schema["Milestone"]["type"]) => item.is_tech ? "Yes" : "No",
    width: 40
  },
  {
    id: "milestone_date",
    header: "Due Date",
    cell: (item: Schema["Milestone"]["type"]) => formatDate(item.targeted_date),
    width: 70
  },
  {
    id: "milestone_goal",
    header: "Goal",
    cell: (item: Schema["Milestone"]["type"]) => item.milestone_goal,
    width: 150
  }
], [handleMilestoneClick, renderStatusIndicator]);


  // Subscription effect
useEffect(() => {
  if (!sca?.id) return;
  
  let subscription: ReturnType<typeof client.models.Milestone.observeQuery> | undefined;
  
  const initializeData = async () => {
    setIsLoading(true);
    try {
      subscription = client.models.Milestone.observeQuery({
        filter: { scaId: { eq: sca.id } }
      }).subscribe({
        next: ({ items, isSynced }: { 
          items: Schema["Milestone"]["type"][], 
          isSynced: boolean 
        }) => {
          const sortedItems = sortMilestones(items);
          setMilestones(sortedItems);
          setFilteredItems(sortedItems);
          setIsLoading(!isSynced);
        },
        error: (error: Error) => {
          console.error('Error in milestone subscription:', error);
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error('Error initializing data:', error);
      setIsLoading(false);
    }
  };

  initializeData();

  return () => {
    if (subscription) {
      subscription.unsubscribe();
    }
  };
}, [sca?.id, sortMilestones]); // Add sortMilestones to the dependency array


  return (
    <>
      <Table
        items={getCurrentPageItems()}
        loading={isLoading}
        columnDefinitions={columnDefinitions}
        selectedItems={selectedItems}
        onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
        columnDisplay={preferences.contentDisplay}
        selectionType="multi"
        trackBy="id"
        //resizableColumns={true}
        empty={
          <Box margin={{ vertical: "xs" }} textAlign="center" color="inherit">
            <SpaceBetween size="m">
              <b>No Milestones</b>
            </SpaceBetween>
          </Box>
        }
        filter={<CustomFilter />}
        header={
          <Header counter={`(${selectedItems.length || filteredItems.length})`}>
            {sca?.partner && sca?.contract_name 
              ? `${sca.partner} - ${sca.contract_name}`
              : 'Milestone List'}
            <ButtonDropdown
              items={[
                { text: "List Milestones", id: "rm", disabled: false },
                { text: "Add Milestone", id: "add", disabled: true },
                { text: "Delete Selected", id: "delete", disabled: selectedItems.length === 0 },
                { text: "Return to SCA Detail", id: "return", disabled: false }
              ]}
              onItemClick={handleActionClick}
            >
              Actions
            </ButtonDropdown>
          </Header>
        }
        pagination={
          <Pagination 
            currentPageIndex={currentPageIndex}
            pagesCount={pagesCount}
            onChange={({ detail }) => setCurrentPageIndex(detail.currentPageIndex)}
          />
        }
        preferences={
          <CollectionPreferences
            title="Preferences"
            confirmLabel="Confirm"
            cancelLabel="Cancel"
            onConfirm={({ detail }) => setPreferences({
              pageSize: detail.pageSize || 10,
              contentDisplay: [...(detail.contentDisplay || [])]
            })}
            preferences={preferences}
            pageSizePreference={{
              title: "Page size",
              options: [
                { value: 10, label: "10 resources" },
                { value: 20, label: "20 resources" }
              ]
            }}
          />
        }
      />
      <DeleteConfirmationModal
        visible={showDeleteModal}
        selectedCount={selectedItems.length}
        onConfirm={handleDeleteMilestones}
        onDismiss={() => setShowDeleteModal(false)}
        confirmationText={deleteConfirmationText}
        onConfirmationTextChange={setDeleteConfirmationText}
      />
    </>
  );
}

export default ScaMilestoneList;
