import { useCallback, useEffect, useMemo, useState } from "react";
//import React, { FC } from 'react';
import type { Schema } from "../../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import Table from "@cloudscape-design/components/table";
import Box from "@cloudscape-design/components/box";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import TextFilter from "@cloudscape-design/components/text-filter";
import Header from "@cloudscape-design/components/header";
import Pagination from "@cloudscape-design/components/pagination";
import CollectionPreferences, { CollectionPreferencesProps } from "@cloudscape-design/components/collection-preferences";
//import Link from "@cloudscape-design/components/link";
import { useLocation, useNavigate } from "react-router-dom";
import ButtonDropdown from "@cloudscape-design/components/button-dropdown";
import Modal from "@cloudscape-design/components/modal";
import Input from "@cloudscape-design/components/input";
//import { Nullable } from "@aws-amplify/data-schema";
//import { LazyLoader } from "@aws-amplify/data-schema/runtime";

const client = generateClient<Schema>();

interface Preferences {
  pageSize: number;
  contentDisplay: Array<{
    id: string;
    visible: boolean;
  }>;
}

function ScaMilestoneList() {
  const [sca, setSca] = useState<Schema["Sca"]["type"] | null>(null);
  const [milestones, setMilestones] = useState<Array<Schema["Milestone"]["type"]>>([]);
  //const [selectedItems, setSelectedItems] = useState<Array<Schema["Sca"]["type"]>>([]);
  //const [filteringText, setFilteringText] = useState<string>('');
  //const [filteredItems, setFilteredItems] = useState<Array<Schema["Sca"]["type"]>>([]);
  //const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [preferences, setPreferences] = useState<Preferences>({
    pageSize: 10,
    contentDisplay: [
      { id: "milestone_type", visible: true },
      { id: "milestone_description", visible: true },
      { id: "is_tech", visible: true },
      { id: "milestone_date", visible: true },
      { id: "milestone_goal", visible: true },
      { id: "last_update", visible: true }
    ]
  });
  
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize state with data from location
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //const [sca] = useState<Schema["Sca"]["type"] | null>(
   // location.state?.sca || null
  //);
  //const [milestones] = useState<Array<Schema["Milestone"]["type"]>>(
   // location.state?.milestones || []
//);

// Adding check from Q to prevent unnecessary redirects
useEffect(() => {
    // Add console logs to debug the state
    //console.log('Location state:', location.state);
    
    if (!location.state) {
        console.log('No state available, redirecting');
        navigate('/scadetail');
        return;
    }

    const { sca, milestones } = location.state;
    
    if (!sca) {
        console.log('No SCA in state, redirecting');
        navigate('/scadetail');
        return;
    }

    // If we have the required data, set it in state
    setSca(sca);
    setMilestones(milestones || []);
    setFilteredItems(milestones || []); // Also set filtered items
}, [location.state, navigate]);

/*
// Add a handler that uses setMilestones
const handleUpdateMilestone = async (milestone: Schema["Milestone"]["type"]) => {
    try {
        const client = generateClient<Schema>();
        const result = await client.models.Milestone.update(milestone);
        
        // Type guard to ensure we have the correct data structure
        if (result && 'data' in result && result.data) {
            const updated = result.data as Schema["Milestone"]["type"];
            setMilestones(current => 
                current.map(m => 
                    m.id === updated.id ? { ...m, ...updated } : m
                )
            );
        }
    } catch (error) {
        console.error('Error updating milestone:', error);
    }
};
*/

  const [selectedItems, setSelectedItems] = useState<Array<Schema["Milestone"]["type"]>>([]);
  const [filteringText, setFilteringText] = useState('');
  const [filteredItems, setFilteredItems] = useState<Array<Schema["Milestone"]["type"]>>(
    location.state?.milestones || []
  );
  const [isLoading, setIsLoading] = useState(false);
  
 // First, memoize the handleFiltering function with useCallback
const handleFiltering = useCallback((text: string) => {
    if (text === undefined) {
      setFilteringText('');
      setFilteredItems(milestones);
      return;
    }
    
    setFilteringText(text);
    
    const filtered = milestones.filter(
      item => 
        (item.milestone_type?.toLowerCase() || '').includes(text.toLowerCase()) ||
        (item.milestone_description?.toLowerCase() || '').includes(text.toLowerCase()) 
    );
    
    setFilteredItems(filtered);
}, [milestones]); // Add milestones as a dependency

// Then update the useEffect to include all dependencies
useEffect(() => {
    handleFiltering(filteringText);
}, [milestones, filteringText, handleFiltering]); // Add all required dependencies


  // Update milestone handler
//  const handleUpdateMilestone = async (milestone: Schema["Milestone"]["type"]) => {
//    try {
 //     const updated = await client.models.Milestone.update(milestone);
//      setMilestones(current => 
//        current.map(m => m.id === updated.id ? updated : m)
 //     );
 //   } catch (error) {
 //     console.error('Error updating milestone:', error);
 //   }
 // };
    const handleMilestoneClick = useCallback((item: Schema["Milestone"]["type"]) => {
    const cleanItem = JSON.parse(JSON.stringify(item));
    navigate('/scamilestonedetail', { state: { item: cleanItem } });
    }, [navigate]); // include navigate in dependencies
 
  // Column definitions for milestones
  const columnDefinitions = useMemo(() => [
    {
        id: "milestone_type",
        header: "Type",
        cell: (item: Schema["Milestone"]["type"]) => item.milestone_type,
        sortingField: "type",
        isRowHeader: true
    },
    {
        id: "milestone_description",
        header: "Description",
        cell: (item: Schema["Milestone"]["type"]) => (
            <Button 
                variant="link" 
                onClick={() => handleMilestoneClick(item)}
            >
                {item.milestone_description}
            </Button>
        ),
        sortingField: "milestone_description"
    },
    {
        id: "is_tech",
        header: "Is Tech?",
        cell: (item: Schema["Milestone"]["type"]) => item.is_tech ? "Yes" : "No"
    },
    {
        id: "milestone_date",
        header: "Milestone Date",
        cell: (item: Schema["Milestone"]["type"]) => item.targeted_date
    },
    {
        id: "milestone_goal",
        header: "Goal",
        cell: (item: Schema["Milestone"]["type"]) => item.milestone_goal
    },
    {
        id: "last_update",
        header: "Last Update",
        cell: (item: Schema["Milestone"]["type"]) => item.latest_actuals
    }
], [handleMilestoneClick]); 

const handleActionClick = ({ detail }: { detail: { id: string } }) => {
    switch (detail.id) {
      case 'delete':
        handleDeleteMilestones();
        break;
      case 'return':
        navigate(-1);  // Navigate back to SCA Detail page
        break;
      // Add other cases as needed
    }
  };

  const handleDeleteMilestones = () => {
    if (selectedItems.length === 0) {
      return;
    }
    setShowDeleteModal(true);
  };
  
  const handleConfirmDelete = async () => {
    if (deleteConfirmationText.toLowerCase() !== 'delete') {
      return; // Don't proceed if the text doesn't match
    }
  
    try {
      // Delete each selected Milestone
      for (const item of selectedItems) {
        await client.models.Milestone.delete(item);
      }
      
      // Clear selection and close modal after successful deletion
      setSelectedItems([]);
      setShowDeleteModal(false);
      setDeleteConfirmationText('');
      
    } catch (error) {
      console.error('Error deleting SCAs:', error);
    }
  };
  
  useEffect(() => {
    if (!sca?.id) return; // Only subscribe if we have a valid SCA

    const subscription = client.models.Milestone.observeQuery({
        filter: { scaId: { eq: sca.id } }
    }).subscribe({
        next: ({ items }) => {
            setMilestones(items);
            setFilteredItems(items);
            setIsLoading(false);
        },
        error: (error) => {
            console.error('Error in milestone subscription:', error);
            setIsLoading(false);
        }
    });

    return () => subscription.unsubscribe();
}, [sca?.id]);

  const handlePreferencesChange: CollectionPreferencesProps['onConfirm'] = ({ detail }) => {
    setPreferences({
      pageSize: detail.pageSize || 10,
      contentDisplay: [...(detail.contentDisplay || [])] // Spread operator to create a mutable copy
    });
  };

  return (
    <><Table
      items={filteredItems || []}
      loading={isLoading}
      columnDefinitions={columnDefinitions}
      renderAriaLive={({ firstIndex, lastIndex, totalItemsCount }) => `Displaying items ${firstIndex} to ${lastIndex} of ${totalItemsCount}`}
      onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
      selectedItems={selectedItems}
      ariaLabels={{
        selectionGroupLabel: "Items selection",
        allItemsSelectionLabel: () => "select all",
      }}
      
      columnDisplay={preferences.contentDisplay}
      enableKeyboardNavigation
      loadingText="Loading resources"
      selectionType="multi"
      trackBy="id"
      empty={<Box margin={{ vertical: "xs" }} textAlign="center" color="inherit">
        <SpaceBetween size="m">
          <b>No Milestones</b>
        </SpaceBetween>
      </Box>}
      filter={<TextFilter
        filteringPlaceholder="Find Milestone"
        filteringText={filteringText || ''}
        onChange={({ detail }) => handleFiltering(detail.filteringText)}
        countText={filteredItems ? `${filteredItems.length} matches` : "0 matches"}
        disabled={false} />}
        header={<Header counter={selectedItems.length ? `(${selectedItems.length}/${filteredItems.length})` : `(${filteredItems.length})`}>
         {sca?.partner && sca?.contract_name 
        ? `${sca.partner} - ${sca.contract_name}`
        : 'Milestone List'}
        <span>     </span>
        <ButtonDropdown
    items={[
        { text: "List Milestones", id: "rm", disabled: false },
        {
          id: "add",
          text: "Add Milestone",
          disabled: true,
          href: "/addsca"
        },
        {
          text: "Delete Selected",
          id: "delete",
          disabled: selectedItems.length === 0
        },
        {
          text: "Return to SCA Detail",
          id: "return",
          disabled: false
        }
      ]}
          onItemClick={handleActionClick}
        >
          Actions
        </ButtonDropdown>
      </Header>}
      pagination={<Pagination currentPageIndex={1} pagesCount={2} />}
      preferences={<CollectionPreferences
        title="Preferences"
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onConfirm={handlePreferencesChange}
        preferences={preferences}
        pageSizePreference={{
          title: "Page size",
          options: [
            { value: 10, label: "10 resources" },
            { value: 20, label: "20 resources" }
          ]
        }}
        wrapLinesPreference={{}}
        stripedRowsPreference={{}}
        contentDensityPreference={{}}
        contentDisplayPreference={{
          options: [
            { id: "variable", label: "Variable name", alwaysVisible: true },
            { id: "value", label: "Text value" },
            { id: "type", label: "Type" },
            { id: "description", label: "Description" }
          ]
        }}
        stickyColumnsPreference={{
          firstColumns: {
            title: "Stick first column(s)",
            description: "Keep the first column(s) visible while horizontally scrolling the table content.",
            options: [
              { label: "None", value: 0 },
              { label: "First column", value: 1 },
              { label: "First two columns", value: 2 }
            ]
          },
          lastColumns: {
            title: "Stick last column",
            description: "Keep the last column visible while horizontally scrolling the table content.",
            options: [
              { label: "None", value: 0 },
              { label: "Last column", value: 1 }
            ]
          }
        }} />} /><Modal
          visible={showDeleteModal}
          onDismiss={() => setShowDeleteModal(false)}
          header="Confirm Deletion"
          closeAriaLabel="Close dialog"
          footer={<Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmDelete}
                disabled={deleteConfirmationText.toLowerCase() !== 'delete'}
              >
                Delete
              </Button>
            </SpaceBetween>
          </Box>}
        >
        <SpaceBetween size="m">
          <Box>
            Are you sure you want to delete {selectedItems.length} selected item(s)?
            Type 'delete' to confirm.
          </Box>
          <Input
            value={deleteConfirmationText}
            onChange={({ detail }) => setDeleteConfirmationText(detail.value)}
            placeholder="Type 'delete' to confirm" />
        </SpaceBetween>
      </Modal></>
  );
}

export default ScaMilestoneList;