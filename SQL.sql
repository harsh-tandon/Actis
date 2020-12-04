USE [ActisFundChecklist]
GO
/****** Object:  StoredProcedure [dbo].[IsAllAnswered]    Script Date: 12/3/2020 7:08:33 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE FUNCTION [dbo].[GetDACPreviewResponses] (
	 @USER_ID			INT,                      
	 @DACFormID			INT,
	 @QSecID			INT,
	 @SecPartID			INT,
	 @ProcessGroupID	INT
    )
 RETURNS TABLE
 AS
 
 RETURN
 SELECT DISTINCT
	DANS.QID,QB.QusetionNo, QB.QuestionText, QB.IsQuestionHeading, QB.DisplayOrder, 
	DANS.QSecID,SB.SecPartID, SB.SubSecName,  QS.SectionName, DANS.USER_ID, DANS.RadioBtnValue, DANS.TextAreaValue, DANS.DACFormID, DANS.ProcessGroupID,
	QB.Metric, DANS.MetricRadioBtnValue, DANS.MetricTextAreaValue
	,[dbo].[GetLinkQuestionId](QB.QID , 'Yes') AS YesLinkQuestionId
	,[dbo].[GetLinkQuestionId](QB.QID , 'No') AS NoLinkQuestionId
FROM [dbo].[DACSectionAnswers] DANS 
	INNER JOIN [dbo].[DACQuestionBank] QB ON QB.QID = DANS.QID
	INNER JOIN [dbo].[DACQuestionSections] QS ON QS.QSecID = DANS.QSecID
	INNER JOIN [dbo].[DACQuestionSubSection] SB ON QB.SecPartID = SB.SecPartID 
WHERE DANS.USER_ID = @USER_ID AND DANS.DACFormID = @DACFormID AND DANS.QSecID = @QSecID AND SB.SecPartID=@SecPartID AND DANS.ProcessGroupID = @ProcessGroupID

GO
----------------------------------------------

ALTER PROCEDURE [dbo].[IsAllAnswered]
    (                 
	 @DACFormID			INT,
	 @QSecID			INT,
	 @SecPartID			INT,
	 @ProcessGroupID	INT,
	 @USER_ID			INT
    )
AS
                                                            
BEGIN 
	SELECT COUNT(A.QID)
	FROM [dbo].[DACSectionAnswers] A
	INNER JOIN [dbo].[DACQuestionBank] B ON A.QID = B.QID AND B.IsQuestionHeading = 0 AND B.SecPartID = @SecPartID
	WHERE A.DACFormID=@DACFormID AND A.QSecID=@QSecID AND A.ProcessGroupID=@ProcessGroupID AND USER_ID=@USER_ID AND A.RadioBtnValue IS NULL
	--FIX TO ANSWER SELECTED QUESTIONS:  16-NOV-20: STARTS
	AND A.QID IN 
	(SELECT DISTINCT
		DANS.QID
	FROM [dbo].[DACSectionAnswers] DANS 
		INNER JOIN [dbo].[DACQuestionBank] QB ON QB.QID = DANS.QID
		INNER JOIN [dbo].[DACQuestionSections] QS ON QS.QSecID = DANS.QSecID
		INNER JOIN [dbo].[DACQuestionSubSection] SB ON QB.SecPartID = SB.SecPartID 
	WHERE DANS.USER_ID = @USER_ID AND DANS.DACFormID = @DACFormID AND DANS.QSecID = @QSecID AND SB.SecPartID=@SecPartID AND DANS.ProcessGroupID = @ProcessGroupID
	--FIX TO ANSWER SELECTED QUESTIONS:  16-NOV-20: ENDS

	-- FIX TO CONSIDER UN-ATTEMPTED QUESTIONS IN PREVIEW PAGE: STARTS
	--AND DANS.RadioBtnValue IS NOT NULL)
	AND 
	(DANS.QID NOT IN
	(SELECT VW1.QID FROM [dbo].[GetDACPreviewResponses](@USER_ID,@DACFormID,@QSecID,@SecPartID,@ProcessGroupID) AS VW1 WHERE RadioBtnValue IS NULL 
	AND DANS.QID NOT IN 
	(SELECT VW2.YesLinkQuestionId FROM [dbo].[GetDACPreviewResponses](@USER_ID,@DACFormID,@QSecID,@SecPartID,@ProcessGroupID) AS VW2 WHERE RadioBtnValue = 'Yes'))

	OR

	DANS.QID NOT IN
	(SELECT VW3.QID FROM [dbo].[GetDACPreviewResponses](@USER_ID,@DACFormID,@QSecID,@SecPartID,@ProcessGroupID) AS VW3 WHERE RadioBtnValue IS NULL 
	AND DANS.QID NOT IN 
	(SELECT VW4.NoLinkQuestionId from [dbo].[GetDACPreviewResponses](@USER_ID,@DACFormID,@QSecID,@SecPartID,@ProcessGroupID) AS VW4 WHERE RadioBtnValue = 'No'))
	))
	-- FIX TO CONSIDER UN-ATTEMPTED QUESTIONS IN PREVIEW PAGE: ENDS
END

GO
-------------------------------------------

ALTER PROCEDURE [dbo].[GetPreviewResponses]
    (   
	 @USER_ID			INT,                      
	 @DACFormID			INT,
	 @QSecID			INT,
	 @SecPartID			INT,
	 @ProcessGroupID	INT--,
	 --@LinkQID           INT = 0
    )                                                          
AS   
                                                            
BEGIN   

SELECT DISTINCT
	DANS.QID,QB.QusetionNo, QB.QuestionText, QB.IsQuestionHeading, QB.DisplayOrder, 
	DANS.QSecID,SB.SecPartID, SB.SubSecName,  QS.SectionName, DANS.USER_ID, DANS.RadioBtnValue, DANS.TextAreaValue, DANS.DACFormID, DANS.ProcessGroupID,
	QB.Metric, DANS.MetricRadioBtnValue, DANS.MetricTextAreaValue
	,[dbo].[GetLinkQuestionId](QB.QID , 'Yes') AS YesLinkQuestionId
	,[dbo].[GetLinkQuestionId](QB.QID , 'No') AS NoLinkQuestionId
FROM [dbo].[DACSectionAnswers] DANS 
	INNER JOIN [dbo].[DACQuestionBank] QB ON QB.QID = DANS.QID
	INNER JOIN [dbo].[DACQuestionSections] QS ON QS.QSecID = DANS.QSecID
	INNER JOIN [dbo].[DACQuestionSubSection] SB ON QB.SecPartID = SB.SecPartID 
WHERE DANS.USER_ID = @USER_ID AND DANS.DACFormID = @DACFormID AND DANS.QSecID = @QSecID AND SB.SecPartID=@SecPartID AND DANS.ProcessGroupID = @ProcessGroupID

-- FIX TO POPULATE UN-ATTEMPTED QUESTIONS IN PREVIEW PAGE: STARTS
--AND (DANS.RadioBtnValue IS NOT NULL OR DANS.RadioBtnValue !='')
AND 
(DANS.QID NOT IN
(SELECT QID FROM [dbo].[GetDACPreviewResponses](@USER_ID,@DACFormID,@QSecID,@SecPartID,@ProcessGroupID) WHERE RadioBtnValue IS NULL 
AND QID NOT IN 
(SELECT YesLinkQuestionId FROM [dbo].[GetDACPreviewResponses](@USER_ID,@DACFormID,@QSecID,@SecPartID,@ProcessGroupID) WHERE RadioBtnValue = 'Yes'))

OR

DANS.QID NOT IN
(SELECT QID FROM [dbo].[GetDACPreviewResponses](@USER_ID,@DACFormID,@QSecID,@SecPartID,@ProcessGroupID) WHERE RadioBtnValue IS NULL 
AND QID NOT IN 
(SELECT NoLinkQuestionId from [dbo].[GetDACPreviewResponses](@USER_ID,@DACFormID,@QSecID,@SecPartID,@ProcessGroupID) WHERE RadioBtnValue = 'No'))
)
-- FIX TO POPULATE UN-ATTEMPTED QUESTIONS IN PREVIEW PAGE: ENDS

ORDER BY DisplayOrder
END

GO
--------------------------------------------------------------

ALTER PROCEDURE [dbo].[GetQuestions] 
@QSecID INT,
@DACFormID INT
AS
BEGIN
	SET NOCOUNT ON;
		DECLARE @ASSETID INT
		BEGIN
			--FIX TO AVOID QUESTIONS WITH BLANK RESPONSES IN ALLIF
			SELECT @ASSETID = AssetID FROM DACFormMaster WHERE DACFormID = @DACFormID

			IF (@ASSETID = 4)
			BEGIN
				SELECT QID, QusetionNo, QuestionText, IsQuestionHeading, QSecID, RadioBtnValue, TextAreaValue
				FROM VU_DAC_SEC_QUES 
				WHERE DACFormID = @DACFormID AND QSecID=@QSecID
				AND ISNULL(RadioBtnValue,'') <> '' --EXTRA CONDITION FOR ALLIF
				ORDER BY DACFormID, QSecID
			END

			ELSE
			BEGIN
				SELECT QID, QusetionNo, QuestionText, IsQuestionHeading, QSecID, RadioBtnValue, TextAreaValue
				FROM VU_DAC_SEC_QUES 
				WHERE DACFormID = @DACFormID AND QSecID=@QSecID
				ORDER BY DACFormID, QSecID
			END
		END
END

GO
--------------------------------------------------------------------------------------------------------------------

ALTER PROCEDURE [dbo].[GetConsolidatedAns]
    (   
	 @DACFormID			INT
    )                                                          
AS   

DECLARE @ASSETID INT
                                                      
BEGIN   

	--FIX TO AVOID QUESTIONS WITH BLANK RESPONSES IN ALLIF
	SELECT @ASSETID = AssetID FROM DACFormMaster WHERE DACFormID = @DACFormID

	IF (@ASSETID = 4)
	BEGIN
		SELECT DISTINCT A.QID,A.QusetionNo,A.QuestionText,A.IsQuestionHeading,A.DisplayOrder,A.QSecID,A.SectionName,A.DACFormID,A.ProcessGroupID, B.RadioBtnValue, B.TextAreaValue
		FROM VU_DAC_Consolidated_A A
		LEFT OUTER JOIN [dbo].[VU_DAC_Consolidated_B] B ON A.QID = B.QID
		WHERE A.DACFormID = @DACFormID 
		AND ISNULL(B.RadioBtnValue,'') <> '' --EXTRA CONDITION FOR ALLIF
		ORDER BY A.QSecID, A.DisplayOrder
	END

	ELSE
	BEGIN
		SELECT DISTINCT A.QID,A.QusetionNo,A.QuestionText,A.IsQuestionHeading,A.DisplayOrder,A.QSecID,A.SectionName,A.DACFormID,A.ProcessGroupID, B.RadioBtnValue, B.TextAreaValue
		FROM VU_DAC_Consolidated_A A
		LEFT OUTER JOIN [dbo].[VU_DAC_Consolidated_B] B ON A.QID = B.QID
		WHERE A.DACFormID = @DACFormID 
		ORDER BY A.QSecID, A.DisplayOrder
	END

END

GO
-------------------------------------------------------------------------------------------------------

ALTER PROCEDURE [dbo].[GetDACDealPartners] 
@DACFormID INT
AS
BEGIN
	SET NOCOUNT ON;
		BEGIN
			DECLARE @AssetID INT
			SELECT @AssetID = AssetID FROM [dbo].[DACFormMaster] WHERE DACFormID = @DACFormID

			SELECT DISTINCT GUMAP.USER_ID, GUMAP.GROUP_ID, AUMAP.AssetID, USR.USER_NAME
			FROM [dbo].[UserGroupMapper] GUMAP
			INNER JOIN [dbo].[AssetUserMapper] AUMAP ON AUMAP.USER_ID = GUMAP.USER_ID AND AUMAP.IsForDAC = 1
			INNER JOIN [dbo].[TBL_USER_MASTER] USR ON USR.USER_ID = GUMAP.USER_ID AND USR.IS_ACTIVE=1
			WHERE GUMAP.GROUP_ID = 24 AND AUMAP.AssetID IN (SELECT AssetID FROM [dbo].[AssetClass] WHERE AssetID = @AssetID AND IsActive = 1)	
			ORDER BY USR.USER_NAME ASC		
		END
END

GO
-------------------------------------------------------------------------------------------------------

ALTER PROCEDURE [dbo].[GetDACDTUsers] 
@DACFormID INT
AS
BEGIN
	DECLARE @AssetID INT
	SELECT @AssetID = AssetID FROM [dbo].[DACFormMaster] WHERE DACFormID=@DACFormID
	SET NOCOUNT ON;
		BEGIN
			SELECT DISTINCT
				A.USER_ID AS drpUSER_ID, C.USER_NAME AS drpUSER_NAME, D.ProjectID, E.ProjectName, A.GROUP_ID, D.GROUP_NAME, B.AssetID, F.AssetName
			FROM 
				[dbo].[UserGroupMapper] A
			INNER JOIN [dbo].[AssetUserMapper] B ON B.USER_ID = A.USER_ID
			INNER JOIN [dbo].[AssetClass] F ON F.AssetID = B.AssetID
			INNER JOIN [dbo].[TBL_USER_MASTER] C ON C.USER_ID = A.USER_ID AND C.IS_ACTIVE=1
			INNER JOIN [dbo].[TBL_USER_GROUP] D ON D.GROUP_ID = A.GROUP_ID
			INNER JOIN [dbo].[ProjectSettings] E ON E.ProjectID = D.ProjectID
			WHERE 
				D.ProjectID=3 AND A.GROUP_ID=21 AND B.AssetID=@AssetID
			ORDER BY 
				C.USER_NAME, A.GROUP_ID, B.AssetID
		END
END

GO
--------------------------------------------------------------------------------------------------------



