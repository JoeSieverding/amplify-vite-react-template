/* eslint-disable */
import { useNavigate } from "react-router-dom";
"use client";
import * as React from "react";
import Form from "@cloudscape-design/components/form";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import { fetchByPath, getOverrideProps, validateField } from "./utils";
import { generateClient } from "aws-amplify/api";
import { getSca } from "./graphql/queries";
import { updateSca } from "./graphql/mutations";
const client = generateClient();
export default function ScaUpdateForm(props) {
  const navigate = useNavigate();

  const {
    id: idProp,
    sca: scaModelProp,
    onSuccess,
    onError,
    onSubmit,
    onValidate,
    onChange,
    overrides,
    ...rest
  } = props;
  const initialValues = {
    partner: "",
    start_date: "",
    end_date: "",
    contract_name: "",
    contract_description: "",
    contract_type: "",
    contract_status: "",
    contract_comments: "",
    contract_aws_contributions: "",
    contract_partner_contributions: "",
    contract_time_based_targets: "",
    contract_primary_industry: "",
    contract_overall_status: "",
    contract_theme: "",
  };
  const [partner, setPartner] = React.useState(initialValues.partner);
  const [start_date, setStart_date] = React.useState(initialValues.start_date);
  const [end_date, setEnd_date] = React.useState(initialValues.end_date);
  const [contract_name, setContract_name] = React.useState(
    initialValues.contract_name
  );
  const [contract_description, setContract_description] = React.useState(
    initialValues.contract_description
  );
  const [contract_type, setContract_type] = React.useState(
    initialValues.contract_type
  );
  const [contract_status, setContract_status] = React.useState(
    initialValues.contract_status
  );
  const [contract_comments, setContract_comments] = React.useState(
    initialValues.contract_comments
  );
  const [contract_aws_contributions, setContract_aws_contributions] =
    React.useState(initialValues.contract_aws_contributions);
  const [contract_partner_contributions, setContract_partner_contributions] =
    React.useState(initialValues.contract_partner_contributions);
  const [contract_time_based_targets, setContract_time_based_targets] =
    React.useState(initialValues.contract_time_based_targets);
  const [contract_primary_industry, setContract_primary_industry] =
    React.useState(initialValues.contract_primary_industry);
  const [contract_overall_status, setContract_overall_status] = React.useState(
    initialValues.contract_overall_status
  );
  const [contract_theme, setContract_theme] = React.useState(
    initialValues.contract_theme
  );
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
//    console.log('scaRecord:', scaRecord);
    const cleanValues = scaRecord
        ? { ...initialValues, ...scaRecord }
        : initialValues;
//    console.log('cleanValues:', cleanValues);
    setPartner(typeof cleanValues.partner === 'string' ? cleanValues.partner : '');
    setStart_date(cleanValues.start_date || "");
    setEnd_date(cleanValues.end_date || "");
    setContract_name(cleanValues.contract_name || "");
    setContract_description(cleanValues.contract_description || "");
    setContract_type(cleanValues.contract_type || "");
    setContract_status(cleanValues.contract_status || "");
    setContract_comments(cleanValues.contract_comments || "");
    setContract_aws_contributions(cleanValues.contract_aws_contributions || "");
    setContract_partner_contributions(cleanValues.contract_partner_contributions || "");
    setContract_time_based_targets(cleanValues.contract_time_based_targets || "");
    setContract_primary_industry(cleanValues.contract_primary_industry || "");
    setContract_overall_status(cleanValues.contract_overall_status || "");
    setContract_theme(cleanValues.contract_theme || "");
    setErrors({});
};

  const [scaRecord, setScaRecord] = React.useState(scaModelProp);
  React.useEffect(() => {
    const queryData = async () => {
      const record = idProp
        ? (
            await client.graphql({
              query: getSca.replaceAll("__typename", ""),
              variables: { id: idProp },
            })
          )?.data?.getSca
        : scaModelProp;
      setScaRecord(record);
    };
    queryData();
  }, [idProp, scaModelProp]);
  React.useEffect(resetStateValues, [scaRecord]);
  const validations = {
    partner: [],
    start_date: [],
    end_date: [],
    contract_name: [],
    contract_description: [],
    contract_type: [],
    contract_status: [],
    contract_comments: [],
    contract_aws_contributions: [],
    contract_partner_contributions: [],
    contract_time_based_targets: [],
    contract_primary_industry: [],
    contract_overall_status: [],
    contract_theme: [],
  };
  const runValidationTasks = async (
    fieldName,
    currentValue,
    getDisplayValue
  ) => {
    const value =
      currentValue && getDisplayValue
        ? getDisplayValue(currentValue)
        : currentValue;
    let validationResponse = validateField(value, validations[fieldName]);
    const customValidator = fetchByPath(onValidate, fieldName);
    if (customValidator) {
      validationResponse = await customValidator(value, validationResponse);
    }
    setErrors((errors) => ({ ...errors, [fieldName]: validationResponse }));
    return validationResponse;
  };
  return (
  <form onSubmit={async (event) => {
    event.preventDefault();
    let modelFields = {
      partner: partner || "",
      start_date: start_date || "",
      end_date: end_date || "",
      contract_name: contract_name || "",
      contract_description: contract_description || "",
      contract_type: contract_type || "",
      contract_status: contract_status || "",
      contract_comments: contract_comments || "",
      contract_aws_contributions: contract_aws_contributions || "",
      contract_partner_contributions: contract_partner_contributions || "",
      contract_time_based_targets: contract_time_based_targets || "",
      contract_primary_industry: contract_primary_industry || "",
      contract_overall_status: contract_overall_status || "",
      contract_theme: contract_theme || "",
    };
    const validationResponses = await Promise.all(
      Object.keys(validations).reduce((promises, fieldName) => {
        if (Array.isArray(modelFields[fieldName])) {
          promises.push(
            ...modelFields[fieldName].map((item) =>
              runValidationTasks(fieldName, item)
            )
          );
          return promises;
        }
        promises.push(
          runValidationTasks(fieldName, modelFields[fieldName])
        );
        return promises;
      }, [])
    );
    if (validationResponses.some((r) => r.hasError)) {
      return;
    }
    if (onSubmit) {
      modelFields = onSubmit(modelFields);
    }
    try {
      Object.entries(modelFields).forEach(([key, value]) => {
        if (typeof value === "string" && value.trim() === "") {
          modelFields[key] = "";
        }
      });
      await client.graphql({
        query: updateSca.replaceAll("__typename", ""),
        variables: {
          input: {
            id: scaRecord.id,
            ...modelFields,
          },
        },
      });
      if (onSuccess) {
        onSuccess(modelFields);
      }
      navigate(-1);
    } catch (err) {
      if (onError) {
        const messages = err.errors.map((e) => e.message).join("\n");
        onError(modelFields, messages);
      }
    }
    }}
    {...getOverrideProps(overrides, "ScaUpdateForm")}
    {...rest}
  >
    <Form
      actions={
        <SpaceBetween direction="horizontal" size="XS">
          <Button
            variation="secondary"
            onClick={(event) => {
              event.preventDefault();
              resetStateValues();
            }}
            isDisabled={!(idProp || scaModelProp)}
            {...getOverrideProps(overrides, "ResetButton")}
          >
            Reset
          </Button>
          <Button
            variation="secondary"
            onClick={() => {
              navigate(-1);
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variation="primary"
          >
            Submit
          </Button>
        </SpaceBetween>
      }
    >
      <Container
        header={
          <Header variant="h2">
          Form container header
          </Header>
        }
      >
<SpaceBetween direction="horizontal" size="1">
  <FormField
    label="Partner"
    controlId="partner-field"
    stretch={false}
  >
    <Input
      value={partner}
      onChange={({ detail }) => {
        let value = detail.value;
        setPartner(value);
        if (onChange) {
          const modelFields = {
            partner: value,
            start_date,
            end_date,
            contract_name,
            contract_description,
            contract_type,
            contract_status,
            contract_comments,
            contract_aws_contributions,
            contract_partner_contributions,
            contract_time_based_targets,
            contract_primary_industry,
            contract_overall_status,
            contract_theme,
          };
          const result = onChange(modelFields);
          value = result?.partner ?? value;
        }
        if (errors.partner?.hasError) {
          runValidationTasks("partner", value);
        }
        setPartner(value);
      }}
      onBlur={() => runValidationTasks("partner", partner)}
      disabled={false}
      readOnly={false}
      errorMessage={errors.partner?.errorMessage}
      hasError={errors.partner?.hasError}
      {...getOverrideProps(overrides, "partner")}
    />
  </FormField>

  <FormField
    label="Start date"
    controlId="start-date-field"
    stretch={false}
  >
    <Input
      value={start_date}
      onChange={({ detail }) => {
        let value = detail.value;
        setStart_date(value);
        if (onChange) {
          const modelFields = {
            partner,
            start_date: value,
            end_date,
            contract_name,
            contract_description,
            contract_type,
            contract_status,
            contract_comments,
            contract_aws_contributions,
            contract_partner_contributions,
            contract_time_based_targets,
            contract_primary_industry,
            contract_overall_status,
            contract_theme,
          };
          const result = onChange(modelFields);
          value = result?.start_date ?? value;
        }
        if (errors.start_date?.hasError) {
          runValidationTasks("start_date", value);
        }
        setStart_date(value);
      }}
      onBlur={() => runValidationTasks("start_date", start_date)}
      disabled={false}
      readOnly={false}
      errorMessage={errors.start_date?.errorMessage}
      hasError={errors.start_date?.hasError}
      {...getOverrideProps(overrides, "start_date")}
    />
  </FormField>

  <FormField
    label="End date"
    controlId="end-date-field"
    stretch={false}
  >
    <Input
      value={end_date}
      onChange={({ detail }) => {
        let value = detail.value;
        setEnd_date(value);
        if (onChange) {
          const modelFields = {
            partner,
            start_date,
            end_date: value,
            contract_name,
            contract_description,
            contract_type,
            contract_status,
            contract_comments,
            contract_aws_contributions,
            contract_partner_contributions,
            contract_time_based_targets,
            contract_primary_industry,
            contract_overall_status,
            contract_theme,
          };
          const result = onChange(modelFields);
          value = result?.end_date ?? value;
        }
        if (errors.end_date?.hasError) {
          runValidationTasks("end_date", value);
        }
        setEnd_date(value);
      }}
      onBlur={() => runValidationTasks("end_date", end_date)}
      disabled={false}
      readOnly={false}
      errorMessage={errors.end_date?.errorMessage}
      hasError={errors.end_date?.hasError}
      {...getOverrideProps(overrides, "end_date")}
    />
  </FormField>

  <FormField
    label="Contract name"
    controlId="contract-name-field"
    stretch={false}
  >
    <Input
      value={contract_name}
      onChange={({ detail }) => {
        let value = detail.value;
        setContract_name(value);
        if (onChange) {
          const modelFields = {
            partner,
            start_date,
            end_date,
            contract_name: value,
            contract_description,
            contract_type,
            contract_status,
            contract_comments,
            contract_aws_contributions,
            contract_partner_contributions,
            contract_time_based_targets,
            contract_primary_industry,
            contract_overall_status,
            contract_theme,
          };
          const result = onChange(modelFields);
          value = result?.contract_name ?? value;
        }
        if (errors.contract_name?.hasError) {
          runValidationTasks("contract_name", value);
        }
        setContract_name(value);
      }}
      onBlur={() => runValidationTasks("contract_name", contract_name)}
      disabled={false}
      readOnly={false}
      errorMessage={errors.contract_name?.errorMessage}
      hasError={errors.contract_name?.hasError}
      {...getOverrideProps(overrides, "contract_name")}
    />
  </FormField>

  <FormField
    label="Contract description"
    controlId="contract-description-field"
    stretch={false}
  >
    <Input
      value={contract_description}
      onChange={({ detail }) => {
        let value = detail.value;
        setContract_description(value);
        if (onChange) {
          const modelFields = {
            partner,
            start_date,
            end_date,
            contract_name,
            contract_description: value,
            contract_type,
            contract_status,
            contract_comments,
            contract_aws_contributions,
            contract_partner_contributions,
            contract_time_based_targets,
            contract_primary_industry,
            contract_overall_status,
            contract_theme,
          };
          const result = onChange(modelFields);
          value = result?.contract_description ?? value;
        }
        if (errors.contract_description?.hasError) {
          runValidationTasks("contract_description", value);
        }
        setContract_description(value);
      }}
      onBlur={() => runValidationTasks("contract_description", contract_description)}
      disabled={false}
      readOnly={false}
      errorMessage={errors.contract_description?.errorMessage}
      hasError={errors.contract_description?.hasError}
      {...getOverrideProps(overrides, "contract_description")}
    />
  </FormField>

  <FormField
    label="Contract type"
    controlId="contract-type-field"
    stretch={false}
  >
    <Input
      value={contract_type}
      onChange={({ detail }) => {
        let value = detail.value;
        setContract_type(value);
        if (onChange) {
          const modelFields = {
            partner,
            start_date,
            end_date,
            contract_name,
            contract_description,
            contract_type: value,
            contract_status,
            contract_comments,
            contract_aws_contributions,
            contract_partner_contributions,
            contract_time_based_targets,
            contract_primary_industry,
            contract_overall_status,
            contract_theme,
          };
          const result = onChange(modelFields);
          value = result?.contract_type ?? value;
        }
        if (errors.contract_type?.hasError) {
          runValidationTasks("contract_type", value);
        }
        setContract_type(value);
      }}
      onBlur={() => runValidationTasks("contract_type", contract_type)}
      disabled={false}
      readOnly={false}
      errorMessage={errors.contract_type?.errorMessage}
      hasError={errors.contract_type?.hasError}
      {...getOverrideProps(overrides, "contract_type")}
    />
  </FormField>

  <FormField
    label="Contract status"
    controlId="contract-status-field"
    stretch={false}
  >
    <Input
      value={contract_status}
      onChange={({ detail }) => {
        let value = detail.value;
        setContract_status(value);
        if (onChange) {
          const modelFields = {
            partner,
            start_date,
            end_date,
            contract_name,
            contract_description,
            contract_type,
            contract_status: value,
            contract_comments,
            contract_aws_contributions,
            contract_partner_contributions,
            contract_time_based_targets,
            contract_primary_industry,
            contract_overall_status,
            contract_theme,
          };
          const result = onChange(modelFields);
          value = result?.contract_status ?? value;
        }
        if (errors.contract_status?.hasError) {
          runValidationTasks("contract_status", value);
        }
        setContract_status(value);
      }}
      onBlur={() => runValidationTasks("contract_status", contract_status)}
      disabled={false}
      readOnly={false}
      errorMessage={errors.contract_status?.errorMessage}
      hasError={errors.contract_status?.hasError}
      {...getOverrideProps(overrides, "contract_status")}
    />
  </FormField>

  <FormField
    label="Contract comments"
    controlId="contract-comments-field"
    stretch={false}
  >
    <Input
      value={contract_comments}
      onChange={({ detail }) => {
        let value = detail.value;
        setContract_comments(value);
        if (onChange) {
          const modelFields = {
            partner,
            start_date,
            end_date,
            contract_name,
            contract_description,
            contract_type,
            contract_status,
            contract_comments: value,
            contract_aws_contributions,
            contract_partner_contributions,
            contract_time_based_targets,
            contract_primary_industry,
            contract_overall_status,
            contract_theme,
          };
          const result = onChange(modelFields);
          value = result?.contract_comments ?? value;
        }
        if (errors.contract_comments?.hasError) {
          runValidationTasks("contract_comments", value);
        }
        setContract_comments(value);
      }}
      onBlur={() => runValidationTasks("contract_comments", contract_comments)}
      disabled={false}
      readOnly={false}
      errorMessage={errors.contract_comments?.errorMessage}
      hasError={errors.contract_comments?.hasError}
      {...getOverrideProps(overrides, "contract_comments")}
    />
  </FormField>

  <FormField
    label="Contract AWS contributions"
    controlId="contract-aws-contributions-field"
    stretch={false}
  >
    <Input
      value={contract_aws_contributions}
      onChange={({ detail }) => {
        let value = detail.value;
        setContract_aws_contributions(value);
        if (onChange) {
          const modelFields = {
            partner,
            start_date,
            end_date,
            contract_name,
            contract_description,
            contract_type,
            contract_status,
            contract_comments,
            contract_aws_contributions: value,
            contract_partner_contributions,
            contract_time_based_targets,
            contract_primary_industry,
            contract_overall_status,
            contract_theme,
          };
          const result = onChange(modelFields);
          value = result?.contract_aws_contributions ?? value;
        }
        if (errors.contract_aws_contributions?.hasError) {
          runValidationTasks("contract_aws_contributions", value);
        }
        setContract_aws_contributions(value);
      }}
      onBlur={() => runValidationTasks("contract_aws_contributions", contract_aws_contributions)}
      disabled={false}
      readOnly={false}
      errorMessage={errors.contract_aws_contributions?.errorMessage}
      hasError={errors.contract_aws_contributions?.hasError}
      {...getOverrideProps(overrides, "contract_aws_contributions")}
    />
  </FormField>

  <FormField
    label="Contract partner contributions"
    controlId="contract-partner-contributions-field"
    stretch={false}
  >
    <Input
      value={contract_partner_contributions}
      onChange={({ detail }) => {
        let value = detail.value;
        setContract_partner_contributions(value);
        if (onChange) {
          const modelFields = {
            partner,
            start_date,
            end_date,
            contract_name,
            contract_description,
            contract_type,
            contract_status,
            contract_comments,
            contract_aws_contributions,
            contract_partner_contributions: value,
            contract_time_based_targets,
            contract_primary_industry,
            contract_overall_status,
            contract_theme,
          };
          const result = onChange(modelFields);
          value = result?.contract_partner_contributions ?? value;
        }
        if (errors.contract_partner_contributions?.hasError) {
          runValidationTasks("contract_partner_contributions", value);
        }
        setContract_partner_contributions(value);
      }}
      onBlur={() => runValidationTasks("contract_partner_contributions", contract_partner_contributions)}
      disabled={false}
      readOnly={false}
      errorMessage={errors.contract_partner_contributions?.errorMessage}
      hasError={errors.contract_partner_contributions?.hasError}
      {...getOverrideProps(overrides, "contract_partner_contributions")}
    />
  </FormField>

  <FormField
    label="Contract time based targets"
    controlId="contract-time-based-targets-field"
    stretch={false}
  >
    <Input
      value={contract_time_based_targets}
      onChange={({ detail }) => {
        let value = detail.value;
        setContract_time_based_targets(value);
        if (onChange) {
          const modelFields = {
            partner,
            start_date,
            end_date,
            contract_name,
            contract_description,
            contract_type,
            contract_status,
            contract_comments,
            contract_aws_contributions,
            contract_partner_contributions,
            contract_time_based_targets: value,
            contract_primary_industry,
            contract_overall_status,
            contract_theme,
          };
          const result = onChange(modelFields);
          value = result?.contract_time_based_targets ?? value;
        }
        if (errors.contract_time_based_targets?.hasError) {
          runValidationTasks("contract_time_based_targets", value);
        }
        setContract_time_based_targets(value);
      }}
      onBlur={() => runValidationTasks("contract_time_based_targets", contract_time_based_targets)}
      disabled={false}
      readOnly={false}
      errorMessage={errors.contract_time_based_targets?.errorMessage}
      hasError={errors.contract_time_based_targets?.hasError}
      {...getOverrideProps(overrides, "contract_time_based_targets")}
    />
  </FormField>

  <FormField
    label="Contract primary industry"
    controlId="contract-primary-industry-field"
    stretch={false}
  >
    <Input
      value={contract_primary_industry}
      onChange={({ detail }) => {
        let value = detail.value;
        setContract_primary_industry(value);
        if (onChange) {
          const modelFields = {
            partner,
            start_date,
            end_date,
            contract_name,
            contract_description,
            contract_type,
            contract_status,
            contract_comments,
            contract_aws_contributions,
            contract_partner_contributions,
            contract_time_based_targets,
            contract_primary_industry: value,
            contract_overall_status,
            contract_theme,
          };
          const result = onChange(modelFields);
          value = result?.contract_primary_industry ?? value;
        }
        if (errors.contract_primary_industry?.hasError) {
          runValidationTasks("contract_primary_industry", value);
        }
        setContract_primary_industry(value);
      }}
      onBlur={() => runValidationTasks("contract_primary_industry", contract_primary_industry)}
      disabled={false}
      readOnly={false}
      errorMessage={errors.contract_primary_industry?.errorMessage}
      hasError={errors.contract_primary_industry?.hasError}
      {...getOverrideProps(overrides, "contract_primary_industry")}
    />
  </FormField>

  <FormField
    label="Contract overall status"
    controlId="contract-overall-status-field"
    stretch={false}
  >
    <Input
      value={contract_overall_status}
      onChange={({ detail }) => {
        let value = detail.value;
        setContract_overall_status(value);
        if (onChange) {
          const modelFields = {
            partner,
            start_date,
            end_date,
            contract_name,
            contract_description,
            contract_type,
            contract_status,
            contract_comments,
            contract_aws_contributions,
            contract_partner_contributions,
            contract_time_based_targets,
            contract_primary_industry,
            contract_overall_status: value,
            contract_theme,
          };
          const result = onChange(modelFields);
          value = result?.contract_overall_status ?? value;
        }
        if (errors.contract_overall_status?.hasError) {
          runValidationTasks("contract_overall_status", value);
        }
        setContract_overall_status(value);
      }}
      onBlur={() => runValidationTasks("contract_overall_status", contract_overall_status)}
      disabled={false}
      readOnly={false}
      errorMessage={errors.contract_overall_status?.errorMessage}
      hasError={errors.contract_overall_status?.hasError}
      {...getOverrideProps(overrides, "contract_overall_status")}
    />
  </FormField>

  <FormField
    label="Contract theme"
    controlId="contract-theme-field"
    stretch={false}
  >
    <Input
      value={contract_theme}
      onChange={({ detail }) => {
        let value = detail.value;
        setContract_theme(value);
        if (onChange) {
          const modelFields = {
            partner,
            start_date,
            end_date,
            contract_name,
            contract_description,
            contract_type,
            contract_status,
            contract_comments,
            contract_aws_contributions,
            contract_partner_contributions,
            contract_time_based_targets,
            contract_primary_industry,
            contract_overall_status,
            contract_theme: value,
          };
          const result = onChange(modelFields);
          value = result?.contract_theme ?? value;
        }
        if (errors.contract_theme?.hasError) {
          runValidationTasks("contract_theme", value);
        }
        setContract_theme(value);
      }}
      onBlur={() => runValidationTasks("contract_theme", contract_theme)}
      disabled={false}
      readOnly={false}
      errorMessage={errors.contract_theme?.errorMessage}
      hasError={errors.contract_theme?.hasError}
      {...getOverrideProps(overrides, "contract_theme")}
    />
  </FormField>
</SpaceBetween>

      </Container>
 
    </Form>
    </form>
  );
}
