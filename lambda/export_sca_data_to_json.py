import boto3
import json
import os
from datetime import datetime
from botocore.exceptions import ClientError
from typing import Dict, Any, List, Optional

class DynamoDBExporter:
    def __init__(self):
        self.dynamodb = boto3.client('dynamodb')
        self.output_dir = '/tmp/sca_output'
        
        # Create output directory if it doesn't exist
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)
    
    def _dynamodb_to_python(self, dynamodb_item: Dict[str, Any]) -> Dict[str, Any]:
        """Convert DynamoDB item format to regular Python dict"""
        if not dynamodb_item:
            return {}
            
        result = {}
        for key, value in dynamodb_item.items():
            # Handle different DynamoDB types
            if 'S' in value:
                result[key] = value['S']
            elif 'N' in value:
                result[key] = float(value['N']) if '.' in value['N'] else int(value['N'])
            elif 'BOOL' in value:
                result[key] = value['BOOL']
            elif 'NULL' in value:
                result[key] = None
            elif 'L' in value:
                result[key] = [self._dynamodb_to_python(item) for item in value['L']]
            elif 'M' in value:
                result[key] = self._dynamodb_to_python(value['M'])
            elif 'SS' in value:
                result[key] = value['SS']
            elif 'NS' in value:
                result[key] = [float(n) if '.' in n else int(n) for n in value['NS']]
        
        return result
    
    def get_sca_by_id(self, sca_id: str) -> Optional[Dict[str, Any]]:
        """Get SCA record by ID"""
        try:
            response = self.dynamodb.get_item(
                TableName='Sca-nl6vtskjlzgetk7hu36lojn3ai-NONE',
                Key={'id': {'S': sca_id}}
            )
            
            if 'Item' in response:
                return self._dynamodb_to_python(response['Item'])
            return None
        except ClientError as e:
            print(f"Error getting SCA: {str(e)}")
            return None
    
    def get_milestones_by_sca_id(self, sca_id: str) -> List[Dict[str, Any]]:
        """Get all milestones for a specific SCA"""
        try:
            response = self.dynamodb.query(
                TableName='Milestone-nl6vtskjlzgetk7hu36lojn3ai-NONE',
                IndexName='byScaId',  # Assuming there's a GSI on scaId
                KeyConditionExpression='scaId = :sca_id',
                ExpressionAttributeValues={':sca_id': {'S': sca_id}}
            )
            
            milestones = []
            for item in response.get('Items', []):
                milestones.append(self._dynamodb_to_python(item))
            
            # Handle pagination if needed
            while 'LastEvaluatedKey' in response:
                response = self.dynamodb.query(
                    TableName='Milestone-nl6vtskjlzgetk7hu36lojn3ai-NONE',
                    IndexName='byScaId',
                    KeyConditionExpression='scaId = :sca_id',
                    ExpressionAttributeValues={':sca_id': {'S': sca_id}},
                    ExclusiveStartKey=response['LastEvaluatedKey']
                )
                
                for item in response.get('Items', []):
                    milestones.append(self._dynamodb_to_python(item))
            
            return milestones
        except ClientError as e:
            print(f"Error getting milestones: {str(e)}")
            return []
    
    def get_milestone_status_by_milestone_id(self, milestone_id: str) -> List[Dict[str, Any]]:
        """Get all status updates for a specific milestone"""
        try:
            response = self.dynamodb.query(
                TableName='MilestoneStatus-nl6vtskjlzgetk7hu36lojn3ai-NONE',
                IndexName='byMilestoneId',  # Assuming there's a GSI on milestoneId
                KeyConditionExpression='milestoneId = :milestone_id',
                ExpressionAttributeValues={':milestone_id': {'S': milestone_id}}
            )
            
            statuses = []
            for item in response.get('Items', []):
                statuses.append(self._dynamodb_to_python(item))
            
            # Handle pagination if needed
            while 'LastEvaluatedKey' in response:
                response = self.dynamodb.query(
                    TableName='MilestoneStatus-nl6vtskjlzgetk7hu36lojn3ai-NONE',
                    IndexName='byMilestoneId',
                    KeyConditionExpression='milestoneId = :milestone_id',
                    ExpressionAttributeValues={':milestone_id': {'S': milestone_id}},
                    ExclusiveStartKey=response['LastEvaluatedKey']
                )
                
                for item in response.get('Items', []):
                    statuses.append(self._dynamodb_to_python(item))
            
            return statuses
        except ClientError as e:
            print(f"Error getting milestone statuses: {str(e)}")
            return []
    
    def export_sca_data(self, sca_id: str) -> Dict[str, Any]:
        """Export SCA, Milestones, and MilestoneStatus data to JSON files"""
        # Get SCA data
        sca_data = self.get_sca_by_id(sca_id)
        if not sca_data:
            raise ValueError(f"SCA with ID {sca_id} not found")
        
        # Get all milestones for this SCA
        milestones = self.get_milestones_by_sca_id(sca_id)
        
        # Get all milestone statuses for each milestone
        all_milestone_statuses = []
        for milestone in milestones:
            milestone_id = milestone.get('id')
            if milestone_id:
                statuses = self.get_milestone_status_by_milestone_id(milestone_id)
                all_milestone_statuses.extend(statuses)
        
        # Write SCA data to JSON file
        sca_file_path = f"{self.output_dir}/sca_{sca_id}.json"
        with open(sca_file_path, 'w') as f:
            json.dump(sca_data, f, indent=2)
        
        # Write Milestones data to JSON file
        milestones_file_path = f"{self.output_dir}/milestones_{sca_id}.json"
        with open(milestones_file_path, 'w') as f:
            json.dump(milestones, f, indent=2)
        
        # Write MilestoneStatus data to JSON file
        milestone_status_file_path = f"{self.output_dir}/milestone_status_{sca_id}.json"
        with open(milestone_status_file_path, 'w') as f:
            json.dump(all_milestone_statuses, f, indent=2)
        
        return {
            'sca_file': sca_file_path,
            'milestones_file': milestones_file_path,
            'milestone_status_file': milestone_status_file_path,
            'sca_count': 1,
            'milestone_count': len(milestones),
            'milestone_status_count': len(all_milestone_statuses)
        }
    
    def export_all_sca_data(self) -> Dict[str, Any]:
        """Export all SCAs with their Milestones and MilestoneStatus data to JSON files"""
        try:
            # Get all SCAs
            response = self.dynamodb.scan(
                TableName='Sca-nl6vtskjlzgetk7hu36lojn3ai-NONE'
            )
            
            scas = []
            for item in response.get('Items', []):
                scas.append(self._dynamodb_to_python(item))
            
            # Handle pagination if needed
            while 'LastEvaluatedKey' in response:
                response = self.dynamodb.scan(
                    TableName='Sca-nl6vtskjlzgetk7hu36lojn3ai-NONE',
                    ExclusiveStartKey=response['LastEvaluatedKey']
                )
                
                for item in response.get('Items', []):
                    scas.append(self._dynamodb_to_python(item))
            
            # Write all SCAs to a single JSON file
            all_scas_file_path = f"{self.output_dir}/all_scas.json"
            with open(all_scas_file_path, 'w') as f:
                json.dump(scas, f, indent=2)
            
            # Export individual SCA data
            exported_files = []
            for sca in scas:
                sca_id = sca.get('id')
                if sca_id:
                    try:
                        result = self.export_sca_data(sca_id)
                        exported_files.append({
                            'sca_id': sca_id,
                            'files': {
                                'sca': f"sca_{sca_id}.json",
                                'milestones': f"milestones_{sca_id}.json",
                                'milestone_status': f"milestone_status_{sca_id}.json"
                            }
                        })
                    except Exception as e:
                        print(f"Error exporting SCA {sca_id}: {str(e)}")
            
            return {
                'all_scas_file': all_scas_file_path,
                'exported_files': exported_files,
                'sca_count': len(scas)
            }
        except ClientError as e:
            print(f"Error exporting all SCAs: {str(e)}")
            return {
                'error': str(e)
            }

def lambda_handler(event, context):
    try:
        exporter = DynamoDBExporter()
        
        # Handle different event sources
        if isinstance(event, str):
            body = json.loads(event)
        elif isinstance(event, dict):
            if 'body' in event:
                body = json.loads(event['body'])
            else:
                body = event
        else:
            raise ValueError("Invalid event format")
        
        # Check if a specific SCA ID was provided
        sca_id = body.get('sca_id')
        
        if sca_id:
            # Export data for a specific SCA
            result = exporter.export_sca_data(sca_id)
            
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'message': f'SCA data exported successfully for SCA ID: {sca_id}',
                    'sca_id': sca_id,
                    'files': {
                        'sca': f"sca_{sca_id}.json",
                        'milestones': f"milestones_{sca_id}.json",
                        'milestone_status': f"milestone_status_{sca_id}.json"
                    },
                    'counts': {
                        'milestones': result['milestone_count'],
                        'milestone_statuses': result['milestone_status_count']
                    }
                })
            }
        else:
            # Export data for all SCAs
            result = exporter.export_all_sca_data()
            
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'message': 'All SCA data exported successfully',
                    'sca_count': result['sca_count'],
                    'files': {
                        'all_scas': 'all_scas.json',
                        'exported_files': result['exported_files']
                    }
                })
            }
        
    except ClientError as e:
        print(f"Database error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': f'Database error: {str(e)}'})
        }
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': f'Unexpected error: {str(e)}'})
        }