SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[GetDACInvestmentAdvisors] 
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
			WHERE GUMAP.GROUP_ID = 23 AND AUMAP.AssetID IN (SELECT AssetID FROM [dbo].[AssetClass] WHERE AssetID = @AssetID AND IsActive = 1)	
			ORDER BY USR.USER_NAME ASC		
		END
END

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

--Add Question details
ALTER PROCEDURE [dbo].[DACAddQuestionDetails]
    (                         
     @AssetId	INT,  
     @SectionId	  INT,
	 @SubSectionId INT,
	 @Staus		BIT,
	 @Mandatory BIT,
	 @QuestionGroupId INT,
	 @QuestionText			VARCHAR(MAX),
	 @YesFollowupText			VARCHAR(MAX),
	 @NoFollowupText			VARCHAR(MAX),
	 @NoteRefText			VARCHAR(MAX),
	 @IsLPSpecific TINYINT,
	 @LP TINYINT,
	 @Metric VARCHAR(MAX),
	 @ClauseRef VARCHAR(MAX),
	 @QuestionNo VARCHAR(10),
	 @ProcessGroupID INT
    )                                                          
AS   
                                                            
BEGIN   
	DECLARE @QuestionMaxId BIGINT
	DECLARE @Questionid BIGINT
	DECLARE @TotalActiveQuestions INT

	DECLARE @QSec BIGINT
	DECLARE @SecPart BIGINT
	DECLARE @QId BIGINT

	-- Get Pre Ic QID start
	 select @QSec = QSecID from DACQuestionSections 
     where AssetID = @AssetId and ProcessGroupID = 1 and
     SectionHeading = (select SectionHeading from DACQuestionSections where QSecID = @SectionId)

     select @SecPart = SecPartID from DACQuestionSubSection 
     where QSecID = @QSec and
     SubSecHeadingText = (select SubSecHeadingText from DACQuestionSubSection where SecPartID = @SubSectionId)

     select Top 1 @QId = (QID) from DACQuestionBank where QSecID = @QSec and SecPartID = @SecPart and QusetionNo = @QuestionNo

   --Get Pre Ic QID end

	INSERT INTO [dbo].[DACQuestionBank] 
	(
			[QusetionNo]  --e.g.FUN-XX31-01
           ,[QuestionText]
           ,[DisplayOrder]
           ,[IsQuestionHeading]
           ,[IsActive]
           ,[IsCompulsory]
           ,[IsSubQuestion]
           --,[ParentQID]
           ,[AssetID]
           ,[QSecID]
           ,[SecPartID]
           ,[QuestionGroupID]  
           ,[PreIC_QID]
           ,[IsLpSpecific]
           ,[LP]
           ,[Metric]
           ,[ClauseReference]
		   ,ProcessGroupId 
	)
	VALUES(
	@QuestionNo
	,@QuestionText
	,1
	,0
	,@Staus
	,@Mandatory
	,0
	, @AssetId
	,@SectionId,
	@SubSectionId
	,@QuestionGroupId
	,@QId
	,@IsLPSpecific
	,@LP
	,@Metric
	,@ClauseRef
	,@ProcessGroupID
	)

	SET @Questionid = @@IDENTITY
	--Insert into Followup Text pass follow text
	INSERT [Dbo].[DACFollowupQuestion]
	(
	QID
	,ResponseType
	,FollowupText
	)
	VALUES
	(
	@Questionid
	,1
	,@YesFollowupText
	)
	--No Followup
	INSERT [Dbo].[DACFollowupQuestion]
	(
	QID
	,ResponseType
	,FollowupText
	)
	VALUES
	(
	@Questionid
	,0
	,@NoFollowupText
	)
	--Note/Reference 

	INSERT [dbo].[DACQuestionRefNote]
	(
	QID
	,QSecID
	,SecPartID
	,QuestionGroupID
	,ReferenceNote
	)
	VALUES
	(
	@Questionid
	,@SectionId
	,@SubSectionId
	,@QuestionGroupId
	,@NoteRefText
	)

	--UPDATE DACQuestionSubSection WITH TOTAL ACTIVE QUESTIONS: Starts
	IF (@AssetId = 4)
	BEGIN	
		SELECT @TotalActiveQuestions = COUNT(*)-1 FROM DACQuestionBank 
			WHERE IsActive = 1 AND QSecID = @SectionId AND SecPartID = @SubSectionId AND AssetID = @AssetId

		UPDATE DACQuestionSubSection SET TotalQuestions = @TotalActiveQuestions 
			WHERE QSecID = @SectionId AND SecPartID = @SubSectionId
	END

	ELSE
	BEGIN
		SELECT @TotalActiveQuestions = COUNT(DISTINCT QuestionGroupID) FROM DACQuestionBank 
			WHERE IsActive = 1 AND QSecID = @SectionId AND SecPartID = @SubSectionId AND AssetID = @AssetId

		UPDATE DACQuestionSubSection SET TotalQuestions = @TotalActiveQuestions 
			WHERE QSecID = @SectionId AND SecPartID = @SubSectionId
	END
	--UPDATE DACQuestionSubSection WITH TOTAL ACTIVE QUESTIONS: Ends

END

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[DACUpdateQuestionDetails]
    (                         
     @AssetId	INT,  
     @SectionId	  INT,
	 @SubSectionId INT,
	 @Staus		BIT,
	 @Mandatory BIT,
	 @QuestionGroupId INT,
	 @QuestionText			VARCHAR(MAX),
	 @YesFollowupText			VARCHAR(MAX),
	 @NoFollowupText			VARCHAR(MAX),
	 @NoteRefText			VARCHAR(MAX),
	 @IsLPSpecific TINYINT,
	 @LP TINYINT,
	 @Metric VARCHAR(MAX),
	 @ClauseRef VARCHAR(MAX),
	 @QID BIGINT,
	 @YesLinkQID BIGINT,
	 @NoLinkQID BIGINT,
	 @QuestionNo VARCHAR(10)
    )                                                          
AS                                                            
BEGIN   
	DECLARE @TotalActiveQuestions INT

	DECLARE @QSec BIGINT
	DECLARE @SecPart BIGINT
	DECLARE @QuesId BIGINT

	-- Get Pre Ic QID start
	 select @QSec = QSecID from DACQuestionSections 
     where AssetID = @AssetId and ProcessGroupID = 1 and
     SectionHeading = (select SectionHeading from DACQuestionSections where QSecID = @SectionId)

     select @SecPart = SecPartID from DACQuestionSubSection 
     where QSecID = @QSec and
     SubSecHeadingText = (select SubSecHeadingText from DACQuestionSubSection where SecPartID = @SubSectionId)

     select Top 1 @QuesId = (QID) from DACQuestionBank where QSecID = @QSec and SecPartID = @SecPart and QusetionNo = @QuestionNo

   --Get Pre Ic QID end

	UPDATE [dbo].[DACQuestionBank] SET
		[QuestionText] = @QuestionText
		,[QuestionGroupID] = @QuestionGroupId
		,[IsLpSpecific] = @IsLPSpecific
		,[LP]=@LP
		,[Metric] = @Metric
		--,[ParentQID] = @LinkQID
		,[QusetionNo] = @QuestionNo
		,[ClauseReference] = @ClauseRef
		,[IsActive]= @Staus
		,[IsCompulsory] = @Mandatory
		,[PreIC_QID] = @QuesId
		,IsSubQuestion =  CASE WHEN (@YesLinkQID != NULL OR @YesLinkQID !=0) OR (@NoLinkQID != NULL OR @NoLinkQID !=0) THEN  1 ELSE 0 END
	WHERE QID = @QID

	--Insert into Followup Text pass follow text
		UPDATE [dbo].[DACFollowupQuestion]
			 SET
				[FollowupText] = @YesFollowupText
				,[LinkedQID] = @YesLinkQID
			WHERE QID = @QID AND ResponseType =1

		UPDATE [dbo].[DACFollowupQuestion]
			SET
			[FollowupText] = @NoFollowupText
			,[LinkedQID] = @NoLinkQID
		WHERE QID = @QID AND ResponseType =0

		UPDATE [dbo].[DACQuestionRefNote]
			 SET
				[ReferenceNote] = @NoteRefText
			WHERE QID = @QID AND QSecID = @SectionId AND SecPartID = @SubSectionId

		--UPDATE DACQuestionSubSection WITH TOTAL ACTIVE QUESTIONS: Starts
		IF (@AssetId = 4)
		BEGIN	
			SELECT @TotalActiveQuestions = COUNT(*)-1 FROM DACQuestionBank 
				WHERE IsActive = 1 AND QSecID = @SectionId AND SecPartID = @SubSectionId AND AssetID = @AssetId

			UPDATE DACQuestionSubSection SET TotalQuestions = @TotalActiveQuestions 
				WHERE QSecID = @SectionId AND SecPartID = @SubSectionId
		END

		ELSE
		BEGIN
			SELECT @TotalActiveQuestions = COUNT(DISTINCT QuestionGroupID) FROM DACQuestionBank 
				WHERE IsActive = 1 AND QSecID = @SectionId AND SecPartID = @SubSectionId AND AssetID = @AssetId

			UPDATE DACQuestionSubSection SET TotalQuestions = @TotalActiveQuestions 
				WHERE QSecID = @SectionId AND SecPartID = @SubSectionId
		END
		--UPDATE DACQuestionSubSection WITH TOTAL ACTIVE QUESTIONS: Ends
END