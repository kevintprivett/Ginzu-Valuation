from enum import Enum
from typing import Optional
from datetime import date

from pydantic import BaseModel, Field, field_validator

"""
Various submodels for final output model
"""
class QuarterlyYearly(BaseModel):
    Q10: float = 0
    K10: float = 0

class YesNo(str, Enum):
    YES = "Yes"
    NO = "No"

"""
Final output model to be inserted into db
"""
class Ticker(BaseModel):
    name: str
    ticker: str
    cik: str
    industry: str
    years10k: float

    revenues: QuarterlyYearly
    ebit: QuarterlyYearly
    interestExpense: QuarterlyYearly
    equity: QuarterlyYearly
    debt: QuarterlyYearly
    cash: QuarterlyYearly
    nonOperatingAssets: QuarterlyYearly
    minorityInterests: QuarterlyYearly

    nol: float
    taxRateEffective: float
    shares: float

    hasRdExpenses: YesNo = "No"
    rdExpenses: list[float] = Field(default_factory=list)

    # hasOptions: YesNo = "No"
    # optionOutstanding: int = 0
    # optionStrike: float = 0.0
    # optionMaturity: float = 0.0

    # debtMaturity: float = 0.0

"""
Model for source record from SEC, ignoring irrelevant fields
"""
class SecRecord(BaseModel):
    model_config = {
        "extra": "ignore"
    }

    end: date # for sorting
    val: float
    frame: str
    fy: int
    fp: str
    form: str

    @field_validator('fy', mode='before')
    @classmethod
    def fy_validator(cls, v):
        if v is None:
            raise ValueError('fy cannot be None')
        return v