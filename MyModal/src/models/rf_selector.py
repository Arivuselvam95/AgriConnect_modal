from sklearn.ensemble import RandomForestRegressor
import pandas as pd

def select_features(X, y, top_n=6):
    rf = RandomForestRegressor(
        n_estimators=300,
        random_state=42
    )
    rf.fit(X, y)

    importance = pd.Series(
        rf.feature_importances_,
        index=X.columns
    ).sort_values(ascending=False)

    return importance.head(top_n).index.tolist(), importance
