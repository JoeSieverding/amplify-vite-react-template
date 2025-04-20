/* eslint-disable */
//import { useNavigate } from "react-router-dom";
"use client";
import * as React from "react";
import { Button, Flex, Grid, TextField } from "@aws-amplify/ui-react";
import { fetchByPath, getOverrideProps, validateField } from "./utils";
import { generateClient } from "aws-amplify/api";
import { getSca } from "./graphql/queries";
import { updateSca } from "./graphql/mutations";
const client = generateClient();
//const navigate = useNavigate();
export default function ScaUpdateForm(props) {
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
    const cleanValues = scaRecord
      ? { ...initialValues, ...scaRecord }
      : initialValues;
    setPartner(cleanValues.partner);
    setStart_date(cleanValues.start_date);
    setEnd_date(cleanValues.end_date);
    setContract_name(cleanValues.contract_name);
    setContract_description(cleanValues.contract_description);
    setContract_type(cleanValues.contract_type);
    setContract_status(cleanValues.contract_status);
    setContract_comments(cleanValues.contract_comments);
    setContract_aws_contributions(cleanValues.contract_aws_contributions);
    setContract_partner_contributions(
      cleanValues.contract_partner_contributions
    );
    setContract_time_based_targets(cleanValues.contract_time_based_targets);
    setContract_primary_industry(cleanValues.contract_primary_industry);
    setContract_overall_status(cleanValues.contract_overall_status);
    setContract_theme(cleanValues.contract_theme);
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
    <Grid
      as="form"
      rowGap="15px"
      columnGap="15px"
      padding="20px"
      onSubmit={async (event) => {
        event.preventDefault();
        let modelFields = {
          partner: partner ?? null,
          start_date: start_date ?? null,
          end_date: end_date ?? null,
          contract_name: contract_name ?? null,
          contract_description: contract_description ?? null,
          contract_type: contract_type ?? null,
          contract_status: contract_status ?? null,
          contract_comments: contract_comments ?? null,
          contract_aws_contributions: contract_aws_contributions ?? null,
          contract_partner_contributions:
            contract_partner_contributions ?? null,
          contract_time_based_targets: contract_time_based_targets ?? null,
          contract_primary_industry: contract_primary_industry ?? null,
          contract_overall_status: contract_overall_status ?? null,
          contract_theme: contract_theme ?? null,
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
            if (typeof value === "string" && value === "") {
              modelFields[key] = null;
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
//          navigate('/scalist');
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
      <TextField
        label="Partner"
        isRequired={false}
        isReadOnly={false}
        value={partner}
        onChange={(e) => {
          let { value } = e.target;
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
        errorMessage={errors.partner?.errorMessage}
        hasError={errors.partner?.hasError}
        {...getOverrideProps(overrides, "partner")}
      ></TextField>
      <TextField
        label="Start date"
        isRequired={false}
        isReadOnly={false}
        value={start_date}
        onChange={(e) => {
          let { value } = e.target;
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
        errorMessage={errors.start_date?.errorMessage}
        hasError={errors.start_date?.hasError}
        {...getOverrideProps(overrides, "start_date")}
      ></TextField>
      <TextField
        label="End date"
        isRequired={false}
        isReadOnly={false}
        value={end_date}
        onChange={(e) => {
          let { value } = e.target;
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
        errorMessage={errors.end_date?.errorMessage}
        hasError={errors.end_date?.hasError}
        {...getOverrideProps(overrides, "end_date")}
      ></TextField>
      <TextField
        label="Contract name"
        isRequired={false}
        isReadOnly={false}
        value={contract_name}
        onChange={(e) => {
          let { value } = e.target;
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
        errorMessage={errors.contract_name?.errorMessage}
        hasError={errors.contract_name?.hasError}
        {...getOverrideProps(overrides, "contract_name")}
      ></TextField>
      <TextField
        label="Contract description"
        isRequired={false}
        isReadOnly={false}
        value={contract_description}
        onChange={(e) => {
          let { value } = e.target;
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
        onBlur={() =>
          runValidationTasks("contract_description", contract_description)
        }
        errorMessage={errors.contract_description?.errorMessage}
        hasError={errors.contract_description?.hasError}
        {...getOverrideProps(overrides, "contract_description")}
      ></TextField>
      <TextField
        label="Contract type"
        isRequired={false}
        isReadOnly={false}
        value={contract_type}
        onChange={(e) => {
          let { value } = e.target;
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
        errorMessage={errors.contract_type?.errorMessage}
        hasError={errors.contract_type?.hasError}
        {...getOverrideProps(overrides, "contract_type")}
      ></TextField>
      <TextField
        label="Contract status"
        isRequired={false}
        isReadOnly={false}
        value={contract_status}
        onChange={(e) => {
          let { value } = e.target;
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
        errorMessage={errors.contract_status?.errorMessage}
        hasError={errors.contract_status?.hasError}
        {...getOverrideProps(overrides, "contract_status")}
      ></TextField>
      <TextField
        label="Contract comments"
        isRequired={false}
        isReadOnly={false}
        value={contract_comments}
        onChange={(e) => {
          let { value } = e.target;
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
        onBlur={() =>
          runValidationTasks("contract_comments", contract_comments)
        }
        errorMessage={errors.contract_comments?.errorMessage}
        hasError={errors.contract_comments?.hasError}
        {...getOverrideProps(overrides, "contract_comments")}
      ></TextField>
      <TextField
        label="Contract aws contributions"
        isRequired={false}
        isReadOnly={false}
        value={contract_aws_contributions}
        onChange={(e) => {
          let { value } = e.target;
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
        onBlur={() =>
          runValidationTasks(
            "contract_aws_contributions",
            contract_aws_contributions
          )
        }
        errorMessage={errors.contract_aws_contributions?.errorMessage}
        hasError={errors.contract_aws_contributions?.hasError}
        {...getOverrideProps(overrides, "contract_aws_contributions")}
      ></TextField>
      <TextField
        label="Contract partner contributions"
        isRequired={false}
        isReadOnly={false}
        value={contract_partner_contributions}
        onChange={(e) => {
          let { value } = e.target;
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
        onBlur={() =>
          runValidationTasks(
            "contract_partner_contributions",
            contract_partner_contributions
          )
        }
        errorMessage={errors.contract_partner_contributions?.errorMessage}
        hasError={errors.contract_partner_contributions?.hasError}
        {...getOverrideProps(overrides, "contract_partner_contributions")}
      ></TextField>
      <TextField
        label="Contract time based targets"
        isRequired={false}
        isReadOnly={false}
        value={contract_time_based_targets}
        onChange={(e) => {
          let { value } = e.target;
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
        onBlur={() =>
          runValidationTasks(
            "contract_time_based_targets",
            contract_time_based_targets
          )
        }
        errorMessage={errors.contract_time_based_targets?.errorMessage}
        hasError={errors.contract_time_based_targets?.hasError}
        {...getOverrideProps(overrides, "contract_time_based_targets")}
      ></TextField>
      <TextField
        label="Contract primary industry"
        isRequired={false}
        isReadOnly={false}
        value={contract_primary_industry}
        onChange={(e) => {
          let { value } = e.target;
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
        onBlur={() =>
          runValidationTasks(
            "contract_primary_industry",
            contract_primary_industry
          )
        }
        errorMessage={errors.contract_primary_industry?.errorMessage}
        hasError={errors.contract_primary_industry?.hasError}
        {...getOverrideProps(overrides, "contract_primary_industry")}
      ></TextField>
      <TextField
        label="Contract overall status"
        isRequired={false}
        isReadOnly={false}
        value={contract_overall_status}
        onChange={(e) => {
          let { value } = e.target;
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
        onBlur={() =>
          runValidationTasks("contract_overall_status", contract_overall_status)
        }
        errorMessage={errors.contract_overall_status?.errorMessage}
        hasError={errors.contract_overall_status?.hasError}
        {...getOverrideProps(overrides, "contract_overall_status")}
      ></TextField>
      <TextField
        label="Contract theme"
        isRequired={false}
        isReadOnly={false}
        value={contract_theme}
        onChange={(e) => {
          let { value } = e.target;
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
        errorMessage={errors.contract_theme?.errorMessage}
        hasError={errors.contract_theme?.hasError}
        {...getOverrideProps(overrides, "contract_theme")}
      ></TextField>
      <Flex
        justifyContent="space-between"
        {...getOverrideProps(overrides, "CTAFlex")}
      >
        <Button
          children="Reset"
          type="reset"
          onClick={(event) => {
            event.preventDefault();
            resetStateValues();
          }}
          isDisabled={!(idProp || scaModelProp)}
          {...getOverrideProps(overrides, "ResetButton")}
        ></Button>
        <Flex
          gap="15px"
          {...getOverrideProps(overrides, "RightAlignCTASubFlex")}
        >
          <Button
            children="Submit"
            type="submit"
            variation="primary"
            isDisabled={
              !(idProp || scaModelProp) ||
              Object.values(errors).some((e) => e?.hasError)
            }
            {...getOverrideProps(overrides, "SubmitButton")}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}
