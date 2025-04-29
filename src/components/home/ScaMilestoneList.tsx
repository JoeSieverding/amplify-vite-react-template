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
  Input
} from "@cloudscape-design/components";

const client = generateClient<Schema>();

interface Preferences {
  pageSize: number;
  contentDisplay: Array<{ id: string; visible: boolean }>;
}

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


const initialPreferences: Preferences = {
  pageSize: 10,
  contentDisplay: [
    { id: "milestone_type", visible: true },
    { id: "milestone_description", visible: true },
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
    textOverflow: 'ellipsis'
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
  const sortMilestones = (milestones: Schema["Milestone"]["type"][]) => {
    return [...milestones].sort((a, b) => {
      // First sort by target date
      if (a.targeted_date && b.targeted_date) {
        if (a.targeted_date < b.targeted_date) return -1;
        if (a.targeted_date > b.targeted_date) return 1;
      } else if (a.targeted_date) {
        return -1; // a has date, b doesn't
      } else if (b.targeted_date) {
        return 1;  // b has date, a doesn't
      }
  
      // If dates are equal, sort by milestone type
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
  };
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
const handleFiltering = useCallback((text: string = '') => {
  setFilteringText(text);
  const filtered = text ? milestones.filter(item => 
    (item.milestone_type?.toLowerCase() || '').includes(text.toLowerCase()) ||
    (item.milestone_description?.toLowerCase() || '').includes(text.toLowerCase())
  ) : milestones;
  setFilteredItems(sortMilestones(filtered));  // Apply sorting to filtered results
}, [milestones]);

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
      width: 100 // Add specific width
    },
    {
      id: "milestone_description",
      header: "Milestone",
      cell: (item: Schema["Milestone"]["type"]) => (
        <div 
          style={styles.milestoneColumn} 
          title={item.milestone_description || ''}
        >
          <Button variant="link" onClick={() => handleMilestoneClick(item)}>
            {item.milestone_description}
          </Button>
        </div>
      ),
      width: 250
    },
    {
      id: "is_tech",
      header: "Is Tech?",
      cell: (item: Schema["Milestone"]["type"]) => item.is_tech ? "Yes" : "No",
      width: 50
    },
    {
      id: "milestone_date",
      header: "Milestone Date",
      cell: (item: Schema["Milestone"]["type"]) => formatDate(item.targeted_date),
      width: 100
    },
    {
      id: "milestone_goal",
      header: "Goal",
      cell: (item: Schema["Milestone"]["type"]) => item.milestone_goal,
      width: 200
    }
  ], [handleMilestoneClick]);

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
}, [sca?.id]);


  return (
    <>
      <Table
        items={filteredItems}
        loading={isLoading}
        columnDefinitions={columnDefinitions}
        selectedItems={selectedItems}
        onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
        columnDisplay={preferences.contentDisplay}
        selectionType="multi"
        trackBy="id"
        empty={
          <Box margin={{ vertical: "xs" }} textAlign="center" color="inherit">
            <SpaceBetween size="m">
              <b>No Milestones</b>
            </SpaceBetween>
          </Box>
        }
        filter={
          <TextFilter
            filteringPlaceholder="Find Milestone"
            filteringText={filteringText}
            onChange={({ detail }) => handleFiltering(detail.filteringText)}
            countText={`${filteredItems.length} matches`}
          />
        }
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
        pagination={<Pagination currentPageIndex={1} pagesCount={2} />}
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
