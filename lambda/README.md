# SCA Suite Lambda Functions

This directory contains Lambda functions for the SCA Suite application.

## export_sca_data_to_json.py

This Lambda function reads SCA (Strategic Collaboration Agreement) records along with associated Milestones and MilestoneStatus records from DynamoDB and exports them to JSON files.

### Features

- Reads SCA records from DynamoDB
- Reads associated Milestone records
- Reads MilestoneStatus records for each Milestone
- Generates JSON files for all entities in `/tmp/sca_output/`
- Can export a single SCA or all SCAs

### Input Format

The Lambda function expects a JSON input with the following structure:

```json
{
  "sca_id": "12345-uuid-example"
}
```

If no `sca_id` is provided, the function will export all SCAs.

### Output

The function returns a JSON response with:

- Status code (200 for success, 500 for error)
- Message indicating success or error
- IDs of exported records
- Paths to generated JSON files
- Counts of exported records

Example success response for a single SCA:

```json
{
  "statusCode": 200,
  "body": {
    "message": "SCA data exported successfully for SCA ID: 12345-uuid-example",
    "sca_id": "12345-uuid-example",
    "files": {
      "sca": "sca_12345-uuid-example.json",
      "milestones": "milestones_12345-uuid-example.json",
      "milestone_status": "milestone_status_12345-uuid-example.json"
    },
    "counts": {
      "milestones": 2,
      "milestone_statuses": 3
    }
  }
}
```

Example success response for all SCAs:

```json
{
  "statusCode": 200,
  "body": {
    "message": "All SCA data exported successfully",
    "sca_count": 5,
    "files": {
      "all_scas": "all_scas.json",
      "exported_files": [
        {
          "sca_id": "12345-uuid-example",
          "files": {
            "sca": "sca_12345-uuid-example.json",
            "milestones": "milestones_12345-uuid-example.json",
            "milestone_status": "milestone_status_12345-uuid-example.json"
          }
        },
        // Additional SCAs...
      ]
    }
  }
}
```

### Generated JSON Files

The function generates the following JSON files in the `/tmp/sca_output/` directory:

1. `sca_{sca_id}.json` - Contains the SCA record
2. `milestones_{sca_id}.json` - Contains all Milestone records for the SCA
3. `milestone_status_{sca_id}.json` - Contains all MilestoneStatus records for the SCA's milestones
4. `all_scas.json` - Contains all SCA records (when exporting all SCAs)

### Deployment

To deploy this Lambda function:

1. Package the function with its dependencies
2. Upload to AWS Lambda
3. Configure appropriate IAM permissions for DynamoDB read access
4. Set environment variables if needed

### Testing

An example input file is provided in `example_input_export.json` for testing purposes.